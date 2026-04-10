import { useState } from "react"
import { toast } from "react-hot-toast"
import { FaSave, FaDownload, FaTrash, FaFolderOpen, FaFileImport } from "react-icons/fa"
import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import projectAPI from "@/api/projectAPI"
import { FileSystemItem } from "@/types/file"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface ProjectManagerProps {
    fileStructure?: FileSystemItem | Record<string, unknown>
    files?: Array<{ id: string; name: string; content: string }>
    drawingData?: Record<string, unknown>
}

const ProjectManager = ({
    fileStructure = {},
    files = [],
    drawingData = {},
}: ProjectManagerProps) => {
    const { currentUser, authToken, isAuthenticated } = useAppContext()
    const { setFileStructure, openFiles, updateFileContent, activeFile } = useFileSystem()
    const [projectName, setProjectName] = useState("")
    const [showInput, setShowInput] = useState(false)
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Array<{ _id: string; projectName: string; createdAt: string }>>([])
    const [showProjects, setShowProjects] = useState(false)

    // Helper function to collect ALL files from fileStructure recursively
    const collectAllFiles = () => {
        // First, save the active file content if there is one
        if (activeFile) {
            updateFileContent(activeFile.id, activeFile.content || "")
        }

        const files: Array<{ id: string; name: string; content: string }> = []

        const traverse = (item: FileSystemItem | Record<string, unknown>) => {
            // Handle both FileSystemItem and plain objects
            if (!item) return

            // If it's a FileSystemItem
            if ("type" in item && "id" in item && "name" in item) {
                const fsItem = item as FileSystemItem
                if (fsItem.type === "file") {
                    // Try to get content from openFiles first (most up-to-date)
                    const openFile = openFiles.find((f) => f.id === fsItem.id)
                    const content = openFile?.content || fsItem.content || ""
                    
                    files.push({
                        id: fsItem.id,
                        name: fsItem.name,
                        content,
                    })
                } else if (fsItem.type === "directory" && fsItem.children) {
                    fsItem.children.forEach(traverse)
                }
            }
        }

        // Start traversal from fileStructure
        if (typeof fileStructure === "object" && fileStructure !== null) {
            traverse(fileStructure as FileSystemItem)
        }

        return files
    }

    const handleSaveProject = async () => {
        if (!isAuthenticated || !authToken) {
            toast.error("Please login to save projects")
            return
        }

        if (!projectName.trim()) {
            toast.error("Please enter a project name")
            return
        }

        if (!currentUser.roomId) {
            toast.error("Please join a room first")
            return
        }

        // Check if project with same name already exists
        const existingProject = projects.find((p) => p.projectName === projectName)
        
        if (existingProject) {
            const confirmReplace = window.confirm(
                `A project named "${projectName}" already exists.\n\nDo you want to replace it with the new content?\n\nClick OK to replace, Cancel to keep both.`
            )
            
            if (!confirmReplace) {
                toast.error("Project not saved. Please use a different name.")
                return
            }
        }

        setLoading(true)
        try {
            const filesToSave = collectAllFiles()
            
            // Log to verify we're collecting all files
            console.log("Files being saved:", filesToSave)
            
            await projectAPI.saveProject(
                {
                    roomId: currentUser.roomId,
                    projectName,
                    fileStructure: (fileStructure as Record<string, unknown>) || {},
                    files: filesToSave,
                    drawingData,
                },
                authToken
            )
            
            // Update projects list locally
            if (existingProject) {
                setProjects(
                    projects.map((p) =>
                        p.projectName === projectName
                            ? { ...p, createdAt: new Date().toISOString() }
                            : p
                    )
                )
                toast.success("Project replaced successfully!")
            } else {
                setProjects([
                    ...projects,
                    {
                        _id: Date.now().toString(),
                        projectName,
                        createdAt: new Date().toISOString(),
                    },
                ])
                toast.success("Project saved successfully!")
            }
            
            setProjectName("")
            setShowInput(false)
        } catch (error: unknown) {
            console.error("Save project error:", error)
            toast.error("Failed to save project")
        } finally {
            setLoading(false)
        }
    }

    const handleLoadProjects = async () => {
        if (!isAuthenticated || !authToken) {
            toast.error("Please login to view projects")
            return
        }

        setLoading(true)
        try {
            const response = await projectAPI.getProjects(authToken)
            setProjects(response.data.projects)
            setShowProjects(!showProjects)
        } catch (error: unknown) {
            console.error("Load projects error:", error)
            toast.error("Failed to load projects")
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadProject = async () => {
        try {
            const zip = new JSZip()

            // Add files to zip
            const filesToDownload = collectAllFiles()
            if (filesToDownload.length > 0) {
                const filesFolder = zip.folder("files")
                if (filesFolder) {
                    filesToDownload.forEach((file) => {
                        filesFolder.file(file.name, file.content)
                    })
                }
            }

            // Add file structure as JSON
            zip.file("file-structure.json", JSON.stringify(fileStructure, null, 2))

            // Add drawing data if exists
            if (drawingData) {
                zip.file("drawing-data.json", JSON.stringify(drawingData, null, 2))
            }

            // Generate and download
            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, `${projectName || "project"}-${Date.now()}.zip`)
            toast.success("Project downloaded!")
        } catch (error: unknown) {
            console.error("Download error:", error)
            toast.error("Failed to download project")
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        if (!authToken) return

        if (!window.confirm("Are you sure you want to delete this project?")) {
            return
        }

        try {
            await projectAPI.deleteProject(projectId, authToken)
            setProjects(projects.filter((p) => p._id !== projectId))
            toast.success("Project deleted successfully!")
        } catch (error: unknown) {
            console.error("Delete error:", error)
            toast.error("Failed to delete project")
        }
    }

    const handleOpenProject = async (projectId: string) => {
        if (!authToken) return

        try {
            setLoading(true)
            const response = await projectAPI.getProjectByRoom(currentUser.roomId, authToken)
            
            if (response.data.project) {
                const project = response.data.project
                
                // Load file structure
                if (project.fileStructure) {
                    setFileStructure(project.fileStructure as FileSystemItem)
                }
                
                toast.success(`Opened project: ${project.projectName}`)
                setShowProjects(false)
            }
        } catch (error: unknown) {
            console.error("Open project error:", error)
            toast.error("Failed to open project")
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="rounded-md border border-gray-600 bg-darkHover p-3 text-center text-sm text-gray-400">
                Login to access project management
            </div>
        )
    }

    return (
        <div className="space-y-3 rounded-md border border-gray-600 bg-darkHover p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-200">Project Manager</h3>

            {/* Save Section */}
            <div className="space-y-2">
                {showInput ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Project name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="flex-1 rounded border border-gray-500 bg-dark px-2 py-1 text-sm text-gray-200 placeholder-gray-500"
                        />
                        <button
                            onClick={handleSaveProject}
                            disabled={loading}
                            className="rounded bg-primary px-3 py-1 text-xs font-semibold text-black hover:bg-opacity-80 disabled:opacity-50"
                        >
                            {loading ? "..." : "Save"}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowInput(true)}
                        className="flex w-full items-center justify-center gap-2 rounded bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-opacity-80"
                    >
                        <FaSave /> Save Project
                    </button>
                )}
            </div>

            {/* Download Section */}
            <button
                onClick={handleDownloadProject}
                className="flex w-full items-center justify-center gap-2 rounded border border-gray-500 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-darkHover"
            >
                <FaDownload /> Download
            </button>

            {/* Projects List Section */}
            <button
                onClick={handleLoadProjects}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded border border-gray-500 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-darkHover disabled:opacity-50"
            >
                <FaFolderOpen /> My Projects
            </button>

            {showProjects && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded border border-gray-600 bg-dark p-2">
                    {projects.length === 0 ? (
                        <p className="text-center text-xs text-gray-400">No projects saved yet</p>
                    ) : (
                        projects.map((project) => (
                            <div
                                key={project._id}
                                className="flex items-center justify-between rounded border border-gray-600 p-2 text-xs hover:bg-darkHover cursor-pointer"
                                onClick={() => handleOpenProject(project._id)}
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-200">{project.projectName}</p>
                                    <p className="text-gray-500">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteProject(project._id)
                                    }}
                                    className="ml-2 rounded p-1 hover:bg-red-500 hover:text-white"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default ProjectManager

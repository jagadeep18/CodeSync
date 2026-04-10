import { Router, Response } from "express"
import Project from "../models/Project"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

// Create/Save a project
router.post("/save", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { roomId, projectName, description, fileStructure, files, drawingData } =
			req.body

		if (!roomId || !projectName) {
			return res.status(400).json({ message: "Room ID and project name are required" })
		}

		// Find existing project by userId, roomId, and projectName (to replace if same name)
		let project = await Project.findOne({ 
			userId: req.userId, 
			roomId,
			projectName
		})

		if (project) {
			// Update existing project with same name
			project.description = description || project.description
			project.fileStructure = fileStructure || project.fileStructure
			project.files = files || project.files
			project.drawingData = drawingData || project.drawingData
			await project.save()
		} else {
			// Create new project
			project = await (Project as any).create({
				userId: req.userId,
				roomId,
				projectName,
				description,
				fileStructure,
				files,
				drawingData,
			})
		}

		res.json({
			success: true,
			message: "Project saved successfully",
			project,
		})
	} catch (error: unknown) {
		console.error("Save project error:", error)
		res.status(500).json({ message: "Failed to save project" })
	}
})

// Get all projects for user
router.get("/list", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const projects = await Project.find({ userId: req.userId }).select(
			"projectName description roomId createdAt updatedAt"
		)
		res.json({
			success: true,
			projects,
		})
	} catch (error: unknown) {
		console.error("List projects error:", error)
		res.status(500).json({ message: "Failed to fetch projects" })
	}
})

// Get a specific project
router.get("/:projectId", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOne({
			_id: req.params.projectId,
			userId: req.userId,
		})

		if (!project) {
			return res.status(404).json({ message: "Project not found" })
		}

		res.json({
			success: true,
			project,
		})
	} catch (error: unknown) {
		console.error("Get project error:", error)
		res.status(500).json({ message: "Failed to fetch project" })
	}
})

// Get project by room ID
router.get("/room/:roomId", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOne({
			roomId: req.params.roomId,
			userId: req.userId,
		})

		if (!project) {
			return res.status(404).json({ message: "Project not found" })
		}

		res.json({
			success: true,
			project,
		})
	} catch (error: unknown) {
		console.error("Get project by room error:", error)
		res.status(500).json({ message: "Failed to fetch project" })
	}
})

// Delete a project
router.delete("/:projectId", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOneAndDelete({
			_id: req.params.projectId,
			userId: req.userId,
		})

		if (!project) {
			return res.status(404).json({ message: "Project not found" })
		}

		res.json({
			success: true,
			message: "Project deleted successfully",
		})
	} catch (error: unknown) {
		console.error("Delete project error:", error)
		res.status(500).json({ message: "Failed to delete project" })
	}
})

// Update only drawing data
router.patch("/:projectId/drawing", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const { drawingData } = req.body

		const project = await Project.findOneAndUpdate(
			{
				_id: req.params.projectId,
				userId: req.userId,
			},
			{ drawingData },
			{ new: true }
		)

		if (!project) {
			return res.status(404).json({ message: "Project not found" })
		}

		res.json({
			success: true,
			message: "Drawing data updated successfully",
			project,
		})
	} catch (error: unknown) {
		console.error("Update drawing error:", error)
		res.status(500).json({ message: "Failed to update drawing" })
	}
})

export default router

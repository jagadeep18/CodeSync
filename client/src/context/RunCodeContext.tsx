import axiosInstance from "@/api/"
import { Language, RunContext as RunContextType } from "@/types/run"
import langMap from "lang-map"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

// Fallback languages with Wandbox compiler names
const WANDBOX_LANGUAGES: Language[] = [
    { language: "javascript", version: "nodejs-20.17.0", aliases: ["js", "javascript"] },
    { language: "typescript", version: "typescript-5.1.3", aliases: ["ts", "typescript"] },
    { language: "python", version: "cpython-3.14.0", aliases: ["py", "python"] },
    { language: "java", version: "openjdk-jdk-21.0.2", aliases: ["java"] },
    { language: "cpp", version: "gcc-14.2.0", aliases: ["cpp", "c++"] },
    { language: "c", version: "gcc-14.2.0-c", aliases: ["c"] },
    { language: "csharp", version: "dotnetcore-8.0", aliases: ["cs", "csharp"] },
    { language: "go", version: "go-1.23.1", aliases: ["go", "golang"] },
    { language: "rust", version: "rust-1.81.0", aliases: ["rs", "rust"] },
    { language: "ruby", version: "ruby-3.3.4", aliases: ["rb", "ruby"] },
    { language: "php", version: "php-8.3.11", aliases: ["php"] },
    { language: "swift", version: "swift-6.0", aliases: ["swift"] },
    { language: "kotlin", version: "kotlin-2.0.20", aliases: ["kt", "kotlin"] },
]

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "",
        version: "",
        aliases: [],
    })

    useEffect(() => {
        // Wandbox compilers are statically mapped in WANDBOX_LANGUAGES for reliability
        setSupportedLanguages(WANDBOX_LANGUAGES)
    }, [])

    // Set the selected language based on the file extension
    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return

        const extension = activeFile.name.split(".").pop()
        if (extension) {
            const languageName = langMap.languages(extension)
            const language = supportedLanguages.find(
                (lang) =>
                    lang.aliases.includes(extension) ||
                    languageName.includes(lang.language.toLowerCase()),
            )
            if (language) setSelectedLanguage(language)
        } else setSelectedLanguage({ language: "", version: "", aliases: [] })
    }, [activeFile?.name, supportedLanguages])

    const runCode = async () => {
        try {
            if (!selectedLanguage) {
                return toast.error("Please select a language to run the code")
            } else if (!activeFile) {
                return toast.error("Please open a file to run the code")
            } else {
                toast.loading("Running code...")
            }

            setIsRunning(true)
            const { version: compiler } = selectedLanguage // We saved Wandbox compiler string in the version field

            const response = await axiosInstance.post("/compile.json", {
                compiler: compiler,
                code: activeFile.content,
                stdin: input,
            })
            
            const rData = response.data
            if (rData.program_message) {
                setOutput(rData.program_message)
            } else if (rData.program_error) {
                setOutput(rData.program_error)
            } else {
                setOutput(rData.status !== "0" ? "Execution failed without output." : "")
            }
            setIsRunning(false)
            toast.dismiss()
        } catch (error: any) {
            console.error(error.response?.data || error)
            setIsRunning(false)
            toast.dismiss()
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
                toast.error("Code execution service unavailable. Check your connection.")
            } else {
                toast.error("Failed to run the code")
            }
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext

import {
    ACTIVITY_STATE,
    AppContext as AppContextType,
    DrawingData,
} from "@/types/app"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import { ReactNode, createContext, useContext, useState, useEffect } from "react"

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext)
    if (context === null) {
        throw new Error(
            "useAppContext must be used within a AppContextProvider",
        )
    }
    return context
}

function AppContextProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<RemoteUser[]>([])
    const [status, setStatus] = useState<USER_STATUS>(USER_STATUS.INITIAL)
    const [currentUser, setCurrentUser] = useState<User>({
        username: "",
        roomId: "",
    })
    const [authToken, setAuthToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [activityState, setActivityState] = useState<ACTIVITY_STATE>(
        ACTIVITY_STATE.CODING,
    )
    const [drawingData, setDrawingData] = useState<DrawingData>(null)

    // Load auth token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("authToken")
        const savedUser = localStorage.getItem("currentUser")

        if (savedToken) {
            setAuthToken(savedToken)
            setIsAuthenticated(true)
        }

        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser))
            } catch (error) {
                console.error("Failed to parse saved user", error)
            }
        }
    }, [])

    // Save auth state to localStorage
    const updateAuthToken = (token: string | null) => {
        setAuthToken(token)
        if (token) {
            localStorage.setItem("authToken", token)
            setIsAuthenticated(true)
        } else {
            localStorage.removeItem("authToken")
            setIsAuthenticated(false)
        }
    }

    const updateCurrentUser = (user: User) => {
        setCurrentUser(user)
        localStorage.setItem("currentUser", JSON.stringify(user))
    }

    const logout = () => {
        try {
            if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
                try {
                    ; (window as any).google.accounts.id.disableAutoSelect()
                    const email = currentUser?.email
                    if (email) {
                        ; (window as any).google.accounts.id.revoke(email, () => {
                            console.log("Google account revoked")
                        })
                    }
                } catch (e) {
                    console.error("Google sign-out failed:", e)
                }
            }
        } catch (e) {
            console.error("Error checking Google sign-out:", e)
        }

        // Clear all authentication data
        updateAuthToken(null)
        updateCurrentUser({ username: "", roomId: "" })

        // Clear session storage
        sessionStorage.clear()

        // Reset status
        setStatus(USER_STATUS.INITIAL)
    }

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                currentUser,
                setCurrentUser: updateCurrentUser,
                status,
                setStatus,
                activityState,
                setActivityState,
                drawingData,
                setDrawingData,
                authToken,
                setAuthToken: updateAuthToken,
                isAuthenticated,
                setIsAuthenticated,
                logout,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export { AppContextProvider }
export default AppContext

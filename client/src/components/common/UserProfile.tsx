import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { USER_STATUS } from "@/types/user"
import { FaSignOutAlt } from "react-icons/fa"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const UserProfile = () => {
    const { currentUser, isAuthenticated, logout, setStatus } = useAppContext()
    const { socket } = useSocket()
    const navigate = useNavigate()

    if (!isAuthenticated) {
        return null
    }

    const handleLogout = () => {
        // Disconnect socket
        socket.disconnect()

        // Clear authentication
        logout()

        // Reset status
        setStatus(USER_STATUS.DISCONNECTED)

        // Show success message
        toast.success("Logged out successfully")

        // Navigate to home/login page
        navigate("/", { replace: true })
    }

    return (
        <div className="flex items-center justify-between rounded-md border border-gray-600 bg-darkHover p-3">
            <div className="flex items-center gap-2">
                {currentUser.profilePicture && (
                    <img
                        src={currentUser.profilePicture}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                    />
                )}
                <div className="text-sm">
                    <p className="font-semibold text-gray-200">{currentUser.username}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="rounded p-2 text-gray-400 hover:bg-red-500 hover:text-white"
                title="Logout"
            >
                <FaSignOutAlt size={16} />
            </button>
        </div>
    )
}

export default UserProfile

import { ChatContext as ChatContextType, ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useSocket } from "./SocketContext"
import { useAppContext } from "./AppContext"

const ChatContext = createContext<ChatContextType | null>(null)

export const useChatRoom = (): ChatContextType => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChatRoom must be used within a ChatContextProvider")
    }
    return context
}

function ChatContextProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false)
    const [lastScrollHeight, setLastScrollHeight] = useState<number>(0)

    useEffect(() => {
        socket.on(
            SocketEvent.RECEIVE_MESSAGE,
            ({ message }: { message: ChatMessage }) => {
                setMessages((messages) => [...messages, message])
                setIsNewMessage(true)

                // Show toast notification only if message is from another user (not current user)
                if (message.username !== currentUser.username) {
                    toast.success(
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-lg text-primary">
                                {message.username}
                            </span>
                            <span className="text-base">{message.message}</span>
                        </div>,
                        {
                            duration: 4000, // 4 seconds
                            position: "bottom-right",
                            style: {
                                background: "#1a1a1a",
                                color: "#fff",
                                border: "2px solid #444",
                                padding: "20px",
                                minWidth: "320px",
                            },
                        }
                    )
                }
            },
        )
        return () => {
            socket.off(SocketEvent.RECEIVE_MESSAGE)
        }
    }, [socket, currentUser.username])

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                isNewMessage,
                setIsNewMessage,
                lastScrollHeight,
                setLastScrollHeight,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export { ChatContextProvider }
export default ChatContext

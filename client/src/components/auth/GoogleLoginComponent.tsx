import { useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useAppContext } from "@/context/AppContext"
import { USER_STATUS } from "@/types/user"

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: unknown) => void
					renderButton: (element: HTMLElement, options: unknown) => void
				}
			}
		}
	}
}

const GoogleLoginComponent = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
	const { setCurrentUser, setAuthToken, setStatus } = useAppContext()
	const googleButtonRef = useRef<HTMLDivElement>(null)
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

	useEffect(() => {
		if (!googleClientId || !googleButtonRef.current) return

		// Load Google Sign-In script
		const script = document.createElement("script")
		script.src = "https://accounts.google.com/gsi/client"
		script.async = true
		script.defer = true
		script.onload = () => {
			if (window.google && googleButtonRef.current) {
				window.google.accounts.id.initialize({
					client_id: googleClientId,
					callback: handleCredentialResponse,
				})
				window.google.accounts.id.renderButton(googleButtonRef.current, {
					type: "standard",
					size: "large",
					logo_alignment: "center",
				})
			}
		}
		document.body.appendChild(script)

		return () => {
			if (script.parentNode) {
				script.parentNode.removeChild(script)
			}
		}
	}, [googleClientId])

	const handleCredentialResponse = async (response: { credential: string }) => {
		try {
			const res = await axios.post(
				`/api/auth/google-login`,
				{ tokenId: response.credential }
			)

			if (res.data.success) {
				const { token, user } = res.data

				setAuthToken(token)
				setCurrentUser({
					username: user.username,
					email: user.email,
					id: user.id,
					profilePicture: user.profilePicture,
					roomId: "",
				})
				setStatus(USER_STATUS.AUTHENTICATED)
				toast.success(`Welcome ${user.username}!`)

				if (onLoginSuccess) {
					onLoginSuccess()
				}
			}
		} catch (error: unknown) {
			console.error("Google login error:", error)
			toast.error("Google login failed. Please try again.")
		}
	}

	if (!googleClientId) {
		return (
			<div className="text-sm text-red-500">
				Google Client ID not configured
			</div>
		)
	}

	return <div ref={googleButtonRef} className="flex justify-center" />
}

export default GoogleLoginComponent

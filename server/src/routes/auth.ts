import { Router, Request, Response } from "express"
import { OAuth2Client } from "google-auth-library"
import bcryptjs from "bcryptjs"
import User from "../models/User"
import { generateToken, authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

// Log the client ID for debugging (only first/last few chars for security)
const clientId = process.env.GOOGLE_CLIENT_ID || ""
console.log("Google Client ID loaded:", clientId ? `${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 10)}` : "NOT SET")

const googleClient = new OAuth2Client(clientId)

// Google Login
router.post("/google-login", async (req: Request, res: Response) => {
	try {
		const { tokenId } = req.body

		if (!tokenId) {
			return res.status(400).json({ message: "Token ID is required" })
		}

		console.log("Attempting to verify Google token...")
		console.log("Expected audience (Client ID):", clientId)

		// Verify the token with Google
		const ticket = await googleClient.verifyIdToken({
			idToken: tokenId,
			audience: clientId,
		})

		const payload = ticket.getPayload()
		if (!payload) {
			return res.status(400).json({ message: "Invalid token" })
		}

		const { sub, email, name, picture } = payload

		let user = await User.findOne({ email })

		if (!user) {
			// Create new user
			user = await (User as any).create({
				googleId: sub,
				email,
				username: name || (email ? email.split("@")[0] : `user_${sub.slice(0, 8)}`),
				profilePicture: picture,
			})
		} else if (!user.googleId) {
			// Update existing user with Google ID
			user.googleId = sub
			user.profilePicture = picture || user.profilePicture
			await user.save()
		}

		const token = generateToken(user._id.toString())

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				profilePicture: user.profilePicture,
			},
		})
	} catch (error: unknown) {
		console.error("Google login error:", error)

		// Try to decode the token to see what audience it has
		if (error instanceof Error && req.body.tokenId) {
			try {
				const tokenParts = req.body.tokenId.split('.')
				if (tokenParts.length === 3) {
					const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
					console.error("Token payload audience (aud):", payload.aud)
					console.error("Expected audience:", clientId)
					console.error("Do they match?", payload.aud === clientId)
				}
			} catch (decodeError) {
				console.error("Could not decode token for debugging:", decodeError)
			}
		}

		res.status(500).json({ message: "Authentication failed" })
	}
})

// Traditional Register
router.post("/register", async (req: Request, res: Response) => {
	try {
		const { email, username, password } = req.body

		if (!email || !username || !password) {
			return res.status(400).json({ message: "All fields are required" })
		}

		let user = await User.findOne({ email })
		if (user) {
			return res.status(400).json({ message: "User already exists" })
		}

		const hashedPassword = await bcryptjs.hash(password, 10)

		user = await (User as any).create({
			email,
			username,
			password: hashedPassword,
		})

		const token = generateToken(user._id.toString())

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
			},
		})
	} catch (error: unknown) {
		console.error("Register error:", error)
		res.status(500).json({ message: "Registration failed" })
	}
})

// Traditional Login
router.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" })
		}

		const user = await User.findOne({ email })
		if (!user || !user.password) {
			return res.status(401).json({ message: "Invalid credentials" })
		}

		const isPasswordValid = await bcryptjs.compare(password, user.password)
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" })
		}

		const token = generateToken(user._id.toString())

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
			},
		})
	} catch (error: unknown) {
		console.error("Login error:", error)
		res.status(500).json({ message: "Login failed" })
	}
})

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const user = await User.findById(req.userId).select("-password")
		res.json({ user })
	} catch (error: unknown) {
		console.error("Get user error:", error)
		res.status(500).json({ message: "Failed to get user" })
	}
})

export default router

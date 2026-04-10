import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export const connectDB = async () => {
	try {
		const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/codenest"
		await mongoose.connect(mongoUri)
		console.log("MongoDB connected successfully")
	} catch (error) {
		console.error("MongoDB connection error:", error)
		process.exit(1)
	}
}

export default mongoose

import mongoose, { Schema } from "mongoose"

export interface IProject extends Document {
	userId: mongoose.Types.ObjectId
	roomId: string
	projectName: string
	description?: string
	fileStructure: Record<string, unknown>
	files: Array<{
		id: string
		name: string
		content: string
		language?: string
	}>
	drawingData?: Record<string, unknown>
	createdAt: Date
	updatedAt: Date
}

const projectSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		roomId: {
			type: String,
			required: true,
		},
		projectName: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		fileStructure: {
			type: Schema.Types.Mixed,
			default: {},
		},
		files: [
			{
				id: String,
				name: String,
				content: String,
				language: String,
			},
		],
		drawingData: {
			type: Schema.Types.Mixed,
			default: null,
		},
	},
	{ timestamps: true }
)

const Project = mongoose.model("Project", projectSchema)

export default Project

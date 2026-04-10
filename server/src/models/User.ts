import mongoose, { Schema } from "mongoose"

export interface IUser extends Document {
	googleId?: string
	email: string
	username: string
	password?: string
	profilePicture?: string
	createdAt: Date
	updatedAt: Date
}

const userSchema = new Schema(
	{
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			default: null,
		},
		profilePicture: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User

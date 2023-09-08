const mongoose = require("mongoose")
const Schema = mongoose.Schema
const UserSchema = new Schema({
	
	profilePic: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	age: { type: String, required: true },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },

	reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
},{ timestamps: true })

let User = mongoose.model("User", UserSchema)
module.exports = User

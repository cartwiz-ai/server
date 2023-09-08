const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ReviewSchema = new Schema({
	
	user: { type: Schema.Types.ObjectId, ref: "User" },
	review: { type: String, required: true },
	rating: { type: Number, required: true },
	product: { type: Schema.Types.ObjectId, ref: "Product" },
	
},{ timestamps: true })

let Review = mongoose.model("Review", ReviewSchema)
module.exports = Review

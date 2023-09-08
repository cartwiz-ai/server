const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ProductSchema = new Schema({
	contentId: { type: Number, required: true, unique: true },
	gender: { type: String, required: true },
	masterCategory: { type: String, required: true },
	subCategory: { type: String, required: true },
	articleType: { type: String, required: true },
	baseColour: { type: String, required: true },
	season: { type: String, required: true },
	year: { type: String, required: true },
	usage: { type: String },
	productDisplayName: { type: String, required: true },
	reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
},{ timestamps: true })

let Product = mongoose.model("Product", ProductSchema)
module.exports = Product
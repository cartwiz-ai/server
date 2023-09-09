const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const { searchRecommendationPrompt } = require("./constants")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args))
const MAKER_SUITE_API_KEY = process.env.MAKER_SUITE_API_KEY

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("CHAT API ONLINE")
})

router.post("/chat/", async (req, res) => {
	let { messages, productJSON } = req.body

	try {
		// 1. Call the /id/:productId to get the product details
		const productData = productJSON

		// 2. Extract key details
		const {
			season,
			gender,
			masterCategory,
			subCategory,
			articleType,
			baseColour,
			usage,
			year,
			productDisplayName,
		} = productData

		// 3. Formulate the example pairs using this data
		const examples = [
			{
				input: {
					content: "What's the season of the product?",
				},
				output: {
					content: `The season of the product is ${season}.`,
				},
			},
			{
				input: {
					content: "Tell me about its gender specification.",
				},
				output: {
					content: `The product is designed for ${gender}.`,
				},
			},
			{
				input: {
					content: "What category does it belong to?",
				},
				output: {
					content: `The product belongs to the ${masterCategory} category.`,
				},
			},
			{
				input: {
					content: "Can you specify its sub-category?",
				},
				output: {
					content: `Sure, it falls under the ${subCategory} sub-category.`,
				},
			},
			{
				input: {
					content: "What type of article is it?",
				},
				output: {
					content: `It is a ${articleType}.`,
				},
			},
			{
				input: {
					content: "What color is the product?",
				},
				output: {
					content: `The product is ${baseColour}.`,
				},
			},
			{
				input: {
					content: "When can one ideally use it?",
				},
				output: {
					content: `It's ideal for ${usage} use.`,
				},
			},
			{
				input: {
					content: "Which year was this designed for?",
				},
				output: {
					content: `This product was designed for the year ${year}.`,
				},
			},
			{
				input: {
					content: "What's the name of the product?",
				},
				output: {
					content: `The product is named ${productDisplayName}.`,
				},
			},
			// ... Add more example pairs if needed
		]

		// 4. Make a call to the desired API with these example pairs
		const apiResponse = await fetch(
			`https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${MAKER_SUITE_API_KEY}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: {
						context: "Product Details",
						examples: examples,
						messages: messages,
					},
					temperature: 0.9,
					top_k: 40,
					top_p: 0.95,
					candidate_count: 1,
				}),
			}
		)

		const apiData = await apiResponse.json()

		// Sending the final response back
		res.status(201).json(apiData.candidates[0].content)
	} catch (error) {
		res.status(500).json({ error: `An erroroccurred: ${error}` })
	}
})

module.exports = router

const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const {
	searchRecommendationPrompt,
	reviewPromptGenerator,
} = require("./constants")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args))
const MAKER_SUITE_API_KEY = process.env.MAKER_SUITE_API_KEY

const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${MAKER_SUITE_API_KEY}`

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("PRODUCT API ONLINE")
})

router.get("/id/:productId", async (req, res) => {
	try {
		const product = await Product.findById(req.params.productId).populate({
			path: "reviews",
			populate: {
				path: "user",
				model: "User",
			},
		})
		if (!product) {
			return res.status(404).json({ error: "Product not found." })
		}

		return res.status(200).json(product)

	} catch (error) {
		const errorMessage = error.message || "Internal Server Error"
		return res.status(500).send(errorMessage)
	}
})

router.get("/home", async (req, res) => {
	try {
		// get all the unique masterCategory values and return random 4 in each category
		const masterCategories = await Product.distinct("masterCategory")
		const randomProducts = await Promise.all(
			masterCategories.map(async (masterCategory) => {
				const products = await Product.find({
					masterCategory: masterCategory,
				}).populate("reviews")
				// get 4 random products from each category
				const randomProducts = products
					.sort(() => Math.random() - Math.random())
					.slice(0, 4)
				return randomProducts
			})
		)

		res.status(200).send(randomProducts)
	} catch (error) {
		const errorMessage = error.message || "Internal Server Error"
		res.status(500).send(errorMessage)
	}
})

router.get("/getProductDetails/:productId", async (req, res) => {
	try {
		let product = await Product.findById(req.params.productId).populate({
			path: "reviews",
			populate: {
				path: "user",
				model: "User",
			},
		})
		if (!product) {
			return res.status(404).json({ error: "Product not found." })
		}

		return res.status(200).json(product)

	} catch (error) {
		const errorMessage = error.message || "Internal Server Error"
		return res.status(500).send(errorMessage)
	}
})

router.get("/getProductRating/:productId", async (req, res) => {
	let productId = req.params.productId

	try {
		let product = await Product.findById(productId)
		if (!product) {
			return res.status(404).json({ error: "Product not found." })
		}

		// populate the reviews array with the review documents
		product = await Product.findById(productId).populate("reviews")

		// each review will have review as string
		// get those and make it as a single string
		const reviews = product.reviews.map((review) => review.review)
		const reviewString = reviews.join(" ")

		let apiResponse = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: {
					text: `${reviewPromptGenerator(reviewString)}`,
				},
				temperature: 0.45,
				candidate_count: 1,
				top_k: 40,
				top_p: 0.95,
				max_output_tokens: 1024,
				stop_sequences: []
			}),
		})

		// Check if the API response is okay
		if (!apiResponse.ok) {
			throw new Error("API response was not okay")
		}

		const data = await apiResponse.json()

		let JSONifiedData = {}

		try {
			JSONifiedData = JSON.parse(data.candidates[0].output)
		} catch (err) {
			JSONifiedData = ""
		}

		res.status(200).send(JSONifiedData)

	} catch (error) {
		const errorMessage = error.message || "Internal Server Error"
		return res.status(500).send(errorMessage)
	}

})

router.get("/getProduct", async (req, res) => {
	let searchString = req.query.searchString

	try {
		const apiResponse = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: {
					text: `${searchRecommendationPrompt} \ninput 2: ${searchString} \noutput 2:`
				},
				temperature: 0.55,
				top_k: 40,
				top_p: 0.95,
				candidate_count: 3,
				max_output_tokens: 1024,
				stop_sequences: [],
				safety_settings: [
					{
						category: "HARM_CATEGORY_DEROGATORY",
						threshold: 1,
					},
					{
						category: "HARM_CATEGORY_TOXICITY",
						threshold: 1,
					},
					{
						category: "HARM_CATEGORY_VIOLENCE",
						threshold: 2,
					},
					{
						category: "HARM_CATEGORY_SEXUAL",
						threshold: 2,
					},
					{
						category: "HARM_CATEGORY_MEDICAL",
						threshold: 2,
					},
					{
						category: "HARM_CATEGORY_DANGEROUS",
						threshold: 2,
					},
				],
			}),
		})

		// Check if the API response is okay
		if (!apiResponse.ok) {
			throw new Error("API response was not okay")
		}

		const data = await apiResponse.json()

		const candidates = data.candidates
		if (!candidates || candidates.length === 0) {
			return res.status(404).json({ error: "No prediction found." })
		}

		let candidate = candidates[0]
		candidate = candidate.output.split("||")

		let query = {}
		query["masterCategory"] = candidate[0]
		query["subCategory"] = candidate[1]
		query["articleType"] = candidate[2]

		// search for product in database
		let results = await Product.find(query)

		// if no results found, search for product with only masterCategory and subCategory
		if (results.length === 0) {
			query = {}
			query["masterCategory"] = candidate[0]
			query["subCategory"] = candidate[1]
			results = await Product.find(query)
		}

		// if still no results found, search for product with only masterCategory
		if (results.length === 0) {
			query = {}
			query["masterCategory"] = candidate[0]
			results = await Product.find(query)
		}

		// if more than 1 result found, return random result
		if (results.length > 1) {
			results = results.sort(() => Math.random() - Math.random())
			return res.status(200).json(results)
		}

		return res.status(404).json({ error: "No product found." })
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Server error.", details: err.message })
	}
})

module.exports = router

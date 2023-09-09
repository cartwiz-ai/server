const express = require("express")
const reviewPrompt = require("./constants")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args))
const Review = require("../../schemas/ReviewSchema")
const reviewsJSON = require("../../result.json")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).send("REVIEW API ONLINE")
})

router.get("/getProduct/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id) // Assuming ProductSchema is a Mongoose model

		if (!product) {
			return res.status(404).send("Product not found")
		}

		// Concatenate the reviews
		const reviews = `${product.Review1}. ${product.Review2}. ${product.Review3}.`

		// Prepare the payload for the API
		const payload = {
			prompt: {
				text: `${reviewPrompt} Text: "${reviews}"\n\nSummary:`,
			},
			temperature: 0.5,
			top_k: 40,
			top_p: 0.95,
			candidate_count: 1,
			max_output_tokens: 1024,
			stop_sequences: [],
			safety_settings: [
				{ category: "HARM_CATEGORY_DEROGATORY", threshold: 1 },
				{ category: "HARM_CATEGORY_TOXICITY", threshold: 1 },
				{ category: "HARM_CATEGORY_VIOLENCE", threshold: 2 },
				{ category: "HARM_CATEGORY_SEXUAL", threshold: 2 },
				{ category: "HARM_CATEGORY_MEDICAL", threshold: 2 },
				{ category: "HARM_CATEGORY_DANGEROUS", threshold: 2 },
			],
		}

		const API_KEY = "YOUR_API_KEY"
		const response = await fetch(
			"https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" +
				API_KEY,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			}
		)

		const jsonResponse = await response.json()

		// Return only the 'output' field
		return res.json({
			output: jsonResponse.candidates[0].output,
		})
	} catch (error) {
		console.error(error)
		return res.status(500).send("Internal Server Error")
	}
})

module.exports = router

// router.get("/addProducts", async (_, res) => {
// 	// changed 'req' to '_' since it is not used
// 	try {
// 		await Promise.all(
// 			reviewsJSON.map(async (review) => {
// 				const { reviews, ...productContents } = review
// 				await Product.create(productContents)
// 			})
// 		)
// 		res.status(200).send("Reviews added")
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).send("Error adding reviews")
// 	}
// })

// router.get("/addRandomReviews", async (_, res) => {
// 	await Promise.all(
// 		reviewsJSON.map(async (review) => {
// 			await Promise.all(
// 				review.reviews.map(async (reviewContent) => {
//                     // find random user from User with aggregate
//                     let randomUser = await User.aggregate([
//                         { $sample: { size: 1 } },
//                     ])

// 					let newReview = await Review.create({
// 						review: reviewContent,
//                         user: randomUser[0]._id,
// 					})

// 					let product = await Product.findOne({
// 						contentId: review.contentId,
// 					})
// 					await Product.findByIdAndUpdate(product._id, {
// 						$push: { reviews: newReview._id },
// 					})

// 					// update user with review
// 					await User.findByIdAndUpdate(randomUser[0]._id, {
// 						$push: { reviews: newReview._id },
// 					})
// 				})
// 			)
// 		})
// 	)
// 	res.status(200).send("Reviews added")
// })

// module.exports = router

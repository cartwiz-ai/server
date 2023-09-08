const express = require("express")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")
const Review = require("../../schemas/ReviewSchema")
const reviewsJSON = require("../../result.json")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("REVIEW API ONLINE")
})

// router.get("/addProducts", async (_, res) => { // changed 'req' to '_' since it is not used
// 	try {
// 		await Promise.all(reviewsJSON.map(async (review) => {
// 			await Product.create({
// 				...review
// 			})
// 		}))
// 		res.status(200).send("Reviews added")
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).send("Error adding reviews")
// 	}
// })

// router.get("/addRandomReviews", async (_, res) => {
// 	await Promise.all(reviewsJSON.map(async (review) => {
// 		await Promise.all(review.reviews.map(async (reviewContent) => {
// 			let newReview = await Review.create({
// 				review: reviewContent
// 			})
// 			await Product.findByIdAndUpdate(review.product, {
// 				$push: { reviews: newReview._id }
// 			})

// 			// find random user from User with aggregate
// 			let randomUser = await User.aggregate([{ $sample: { size: 1 } }])

// 			// update user with review
// 			await User.findByIdAndUpdate(randomUser[0]._id, {
// 				$push: { reviews: newReview._id }
// 			})
// 		}))
// 	}))

// 	res.status(200).send("Reviews added")
// })



module.exports = router

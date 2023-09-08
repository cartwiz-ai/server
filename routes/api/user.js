const express = require("express")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
// import user.json
const userJson = require("../../users.json")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("USER API ONLINE")
})

// router.get("/addRandom", async (_, res) => {

// 	// use promise.all to wait for all promises to resolve
// 	await Promise.all(userJson.map(async (user) => {
// 		await User.create(user)
// 	}))

// 	res.status(200).send("Added random users")

// })

module.exports = router

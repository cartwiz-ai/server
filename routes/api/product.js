const express = require("express")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("PRODUCT API ONLINE")
})

module.exports = router

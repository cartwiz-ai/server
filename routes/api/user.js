const express = require("express")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("USER API ONLINE")
})

module.exports = router

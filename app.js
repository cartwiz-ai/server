const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const app = express()
const cors = require('cors')
require("./database")
const port = process.env.PORT || 4003

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// API Routes
const userAPI = require("./routes/api/user")
const productAPI = require("./routes/api/product")

app.use("/api/user", userAPI)
app.use("/api/product", productAPI)

app.get("/", (_, res) => {
	res.status(200).send("CARTWIZ ENDPOINT ONLINE")
})
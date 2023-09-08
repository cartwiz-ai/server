const express = require("express")
const searchRecommendationPrompt = require("./constants")
const app = express()
const router = express.Router()
const User = require("../../schemas/UserSchema")
const Product = require("../../schemas/ProductSchema")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/", (_, res) => {
	res.status(200).render("PRODUCT API ONLINE")
})

router.get("/home", async (req, res) => {
	try {
		// get all the unique masterCategory values and return random 4 in each category
		const masterCategories = await Product.distinct("masterCategory")
		const randomProducts = await Promise.all(masterCategories.map(async (masterCategory) => {
			const products = await Product.find({ masterCategory: masterCategory })
			// get 4 random products from each category
			const randomProducts = products.sort(() => Math.random() - Math.random()).slice(0, 4)
			return randomProducts
		}))

		res.status(200).send(randomProducts)
	} catch (error) {
		const errorMessage = error.message || "Internal Server Error"
		res.status(500).send(errorMessage)
	}
})

router.post("/getProduct", async (req, res) => {
	let searchString = req.body.searchString
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=YOUR_API_KEY';

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                        "category": "HARM_CATEGORY_DEROGATORY",
                        "threshold": 1
                    },
                    {
                        "category": "HARM_CATEGORY_TOXICITY",
                        "threshold": 1
                    },
                    {
                        "category": "HARM_CATEGORY_VIOLENCE",
                        "threshold": 2
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUAL",
                        "threshold": 2
                    },
                    {
                        "category": "HARM_CATEGORY_MEDICAL",
                        "threshold": 2
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS",
                        "threshold": 2
                    }
                ]
            })
        });

        // Check if the API response is okay
        if (!apiResponse.ok) {
            throw new Error("API response was not okay");
        }

        const data = await apiResponse.json();
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ error: "No prediction found." });
        }

        // Iterate over candidates and find a match in the database
        for (let candidate of candidates) {
            const searchParams = candidate.output.split("||");

            // This order is based on the priority you mentioned
            const fields = [
                'masterCategory',
                'subCategory',
                'articleType',
                'baseColour',
                'season'
            ];

            let query = {};
            for (let i = 0; i < searchParams.length; i++) {
                query[fields[i]] = searchParams[i];
            }

            const product = await Product.findOne(query);
            if (product) {
                return res.status(200).json(product);
            }
        }

        return res.status(404).json({ error: "Product not found." });

    } catch (err) {
        return res.status(500).json({ error: "Server error.", details: err.message });
    }
});


module.exports = router

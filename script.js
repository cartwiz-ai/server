// sample json

// {
// 	"contentId": 15970,
// 	"gender": "Men",
// 	"masterCategory": "Apparel",
// 	"subCategory": "Topwear",
// 	"articleType": "Shirts",
// 	"baseColour": "Navy Blue",
// 	"season": "Fall",
// 	"year": 2011,
// 	"usage": "Casual",
// 	"productDisplayName": "Turtle Check Men Navy Blue Shirt",
// 	"output": "Apparel||Topwear||Shirts||Navy Blue||Fall",
// 	"Review1": "A blend of style and comfort, this Apparel Shirts is a must-have.\nThe vibrant Navy Blue shade adds to its appeal.\nGreat for Casual activities in Fall.",
// 	"Review2": "If you're seeking a Apparel Shirts that merges style with functionality, this is it.\nIts Navy Blue color is both chic and versatile.\nSuitable for Casual use in Fall.",
// 	"Review3": "The craftsmanship of this Apparel Shirts is evident.\nIts Navy Blue color complements various outfits.\nEspecially designed for Casual during Fall."
// },

// result.json is an array of such objects. But isntead of having Review1, Review2, Review3, we will have an array of reviews.

let reviewsJSON = require("./result.json")
let newReviewsJSON = reviewsJSON.map((review) => {
	let reviews = []
	for (let i = 1; i <= 3; i++) {
		reviews.push(review[`Review${i}`])
	}
	return {
		...review,
		reviews
	}
})

let fs = require("fs")
fs.writeFileSync("./result.json", JSON.stringify(newReviewsJSON, null, 2))
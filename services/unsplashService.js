require("dotenv").config();
const axios = require("axios");

const UNSPLASH_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Function to search for images on Unsplash
async function searchImages(query) {
  try {
    // Check if Unsplash access key is available
    if (!UNSPLASH_ACCESS_KEY) {
      throw new Error(
        "Unsplash Access key is missing, please check your .env file"
      );
    }
    // Make a request to Unsplash API to search for images
    const response = await axios.get(UNSPLASH_URL, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query, // Search query provided by the user
        per_page: 10, // Limit results to 10 images
      },
    });

    const results = response.data.results;
    const photos = [];
    // Loop through results and extract necessary data
    for (let i = 0; i < results.length; i++) {
      const photo = results[i];

      const imageData = {
        imageUrl: photo.urls?.regular || "", // Image URL
        description: photo.description || "No description available", // Image description
        altDescription:
          photo.altDescription || "No Alternate description available", // Alternate description
      };
      photos.push(imageData);
    }
    if (photos.length === 0) {
      return { message: "No images found for given query" };
    }
    return { photos };
  } catch (error) {
    console.error("Error fetching images from Unsplash:", error.message);
    throw new Error("Failed to fetch images from unsplash");
  }
}

module.exports = { searchImages };

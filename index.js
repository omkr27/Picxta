const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createNewUser } = require("./controllers/userController.js");
const {
  searchPhotos,
  savePhoto,
  addTagsToPhoto,
  searchPhotosByTag,
  getSearchHistory,
} = require("./controllers/photoController.js");

const { sequelize } = require("./models");

const app = express();

app.use(express.json());
app.use(cors());

// User Routes
app.post("/api/users", createNewUser); // Route to create a new user

// Photo Routes
app.post("/api/photos", savePhoto); // Route to save a photo
app.post("/api/photos/:photoId/tags", addTagsToPhoto); // Route to add tags to a photo

// Search Routes
app.get("/api/photos/search", searchPhotos); // Route to search photos from Unsplash
app.get("/api/photos/tag/search", searchPhotosByTag); // Route to search photos by tag
app.get("/api/search-history", getSearchHistory); // Route to fetch user's search history

// Connect to the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database", error);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

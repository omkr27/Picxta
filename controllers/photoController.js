const { searchImages } = require("../services/unsplashService.js");
const { Op } = require("sequelize");
const { photo, tag, searchHistory } = require("../models");

//controller to search for photos
const searchPhotos = async (req, res) => {
  try {
    const { query } = req.query;
    //validate if query paramneter is provided
    if (!query) {
      return res.status(400).json({ error: "A search term is required." });
    }
    //call unsplash API service function to fetch photos
    const result = await searchImages(query);
    return res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

//controller to save photo into database
const savePhoto = async (req, res) => {
  try {
    const { imageUrl, description, altDescription, tags, userId } = req.body;

    //validate image URL(must be from unsplash)
    if (!imageUrl.startsWith("https://images.unsplash.com/")) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    //validate tags if provided
    if (tags) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ message: "tags must be an array." });
      }
      if (tags.length > 5) {
        return res
          .status(400)
          .json({ message: "photo can have maximum 5 tags." });
      }
      if (tags.some((tag) => tag.length > 20)) {
        return res
          .status(400)
          .json({ message: "Each tag must be 20 characters long" });
      }
    }
    //save photo to database
    const savedPhoto = await photo.create({
      imageUrl,
      description,
      altDescription,
      userId,
    });

    if (tags && tags.length > 0) {
      const tagEntries = tags.map((tagName) => ({
        name: tagName,
        photoId: savedPhoto.id,
      }));
      await tag.bulkCreate(tagEntries);
    }

    return res.status(201).json({ message: "Photo saved successfully" });
  } catch (error) {
    console.error("Error saving photo:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//controller to add tags to a specific photo
const addTagsToPhoto = async (req, res) => {
  const { photoId } = req.params;
  const { tags } = req.body;

  try {
    //validate tag input
    if (
      !Array.isArray(tags) ||
      tags.some((tag) => typeof tag !== "string" || tag.trim() === "")
    ) {
      return res
        .status(400)
        .json({ message: "Tags must be non-empty string." });
    }
    //find photo by photoId
    const image = await photo.findByPk(photoId);
    if (!image) {
      return res.status(404).json({ message: "Photo not found." });
    }

    //count existing tags for photo
    const existingTags = await tag.count({ where: { photoId } });

    //ensure adding new tags doesn't exceed the limit of 5 tags
    if (existingTags + tags.length > 5) {
      return res
        .status(400)
        .json({ message: "A photo can have maximum of 5 Tags." });
    }

    //save the new tags to database
    const newTags = tags.map((tag) => ({ name: tag, photoId: photoId }));
    await tag.bulkCreate(newTags);
    return res.status(201).json({ message: "Tags added successfully." });
  } catch (error) {
    console.error("Error adding tags:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//controller to search for photos by tag
const searchPhotosByTag = async (req, res) => {
  try {
    const { tags, sort = "ASC", userId } = req.query;

    //validation: only one tag should be provided
    if (!tags || typeof tags !== "string") {
      return res
        .status(400)
        .json({ message: "A single valid tag  must be provided." });
    }

    //validate sort order(must be either ASC or DESC)
    const validateSortOrders = ["ASC", "DESC"];
    if (!validateSortOrders.includes(sort.toUpperCase())) {
      return res.status(400).json({ message: "Invalid sort order" });
    }

    //check if the tag exists in database
    const availableTag = await tag.findOne({ where: { name: tags } });
    if (!availableTag) {
      return res.status(404).json({ message: "Tag not found." });
    }

    const whereCondition = {};
    if (userId) {
      whereCondition.userId = userId;
    }

    // Fetch all photos associated with the tag
    const photos = await photo.findAll({
      where: whereCondition,
      include: [
        {
          model: tag,
          attributes: ["name"],
          where: { name: tags },
          required: true,
        },
      ],
      order: [["dateSaved", sort.toUpperCase()]], // Sort by dateSaved
    });

    // Handle case when no photos found
    if (photos.length === 0) {
      return res.status(404).json({
        message: "No photos found with the specified tag for this user.",
      });
    }

    // Log search history if userId is provided
    if (userId) {
      await searchHistory.create({ userId, query: tags });
    }

    // Format and return  response
    const formattedPhotos = photos.map((photo) => ({
      imageUrl: photo.imageUrl,
      description: photo.description,
      dateSaved: photo.dateSaved,
      tags: photo.tags.map((tag) => tag.name), // Extract associated tags
    }));

    return res.status(200).json({ photos: formattedPhotos });
  } catch (error) {
    console.error("Error searching photos:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//controller to fetch search history for user
const getSearchHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    // Validate userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid userId is required." });
    }

    // Fetch search history for the user
    const fetchHistory = await searchHistory.findAll({
      where: { userId },
      attributes: ["query", "createdAt"], // Select query and timestamp only
      order: [["createdAt", "DESC"]], // Sort by latest search
    });
    //return search history
    return res.status(200).json({
      searchHistory: fetchHistory.map((entry) => ({
        query: entry.query,
        timestamp: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  searchPhotos,
  savePhoto,
  addTagsToPhoto,
  searchPhotosByTag,
  getSearchHistory,
};

const {
  searchPhotos,
  savePhoto,
  addTagsToPhoto,
  searchPhotosByTag,
  getSearchHistory,
} = require("../controllers/photoController");

const { searchImages } = require("../services/unsplashService");
const { photo, tag, searchHistory } = require("../models");

jest.mock("../services/unsplashService", () => ({
  searchImages: jest.fn(),
}));

jest.mock("../models", () => ({
  photo: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
  tag: { bulkCreate: jest.fn(), count: jest.fn(), findOne: jest.fn() },
  searchHistory: { findAll: jest.fn(), create: jest.fn() },
}));

describe("Photo Controller tests", () => {
  test("should search photos", async () => {
    const mockResponse = [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1704340142770-b52988e5b6eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY0OTl8MXwxfHNlYXJjaHwxfHxjYXJ8ZW58MHx8fHwxNzQzNjI3MzM4fDA&ixlib=rb-4.0.3&q=80&w=1080",
        description: "A sketch of the left side view of the Kia Concept EV4.",
        altDescription: "No Alternate description available",
      },
    ];
    searchImages.mockResolvedValue(mockResponse);

    const req = { query: { query: "car" } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchPhotos(req, res);

    expect(searchImages).toHaveBeenCalledWith("car");
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  test("should return error if no search query is provided", async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchPhotos(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "A search term is required.",
    });
  });

  test("should save photo", async () => {
    const req = {
      body: {
        imageUrl: "https://images.unsplash.com/photo-123456",
        description: "Beautiful sunset",
        altDescription: "Sunset over the mountains",
        tags: ["nature", "sunset", "landscape"],
        userId: 1,
      },
    };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await savePhoto(req, res);

    expect(photo.create).toHaveBeenCalledWith({
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      altDescription: req.body.altDescription,
      userId: req.body.userId,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Photo saved successfully",
    });
  });

  test("should not save photo with invalid image URL", async () => {
    const req = {
      body: { imageUrl: "https://example.com/photo.jpg", tags: [] },
    };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await savePhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid image URL" });
  });

  test("should add tags to a photo", async () => {
    photo.findByPk.mockResolvedValue(true);
    tag.count.mockResolvedValue(2);

    const req = {
      params: { photoId: 1 },
      body: { tags: ["travel", "adventure"] },
    };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await addTagsToPhoto(req, res);

    expect(tag.bulkCreate).toHaveBeenCalledWith([
      { name: "travel", photoId: 1 },
      { name: "adventure", photoId: 1 },
    ]);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tags added successfully.",
    });
  });

  test("should not add tags if tag limit is exceeded", async () => {
    photo.findByPk.mockResolvedValue(true);
    tag.count.mockResolvedValue(4);

    const req = {
      params: { photoId: 1 },
      body: { tags: ["food", "beach"] },
    };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await addTagsToPhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "A photo can have maximum of 5 Tags.",
    });
  });

  test("should search photos by tag", async () => {
    tag.findOne.mockResolvedValue({ name: "nature" });
    photo.findAll.mockResolvedValue([
      {
        imageUrl: "https://images.unsplash.com/photo-123456",
        description: "Beautiful sunset",
        dateSaved: "2025-04-01T09:44:57.678Z",
        tags: [{ name: "sunset" }],
      },
    ]);

    const req = { query: { tags: "sunset", sort: "ASC", userId: 1 } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchPhotosByTag(req, res);

    expect(tag.findOne).toHaveBeenCalledWith({ where: { name: "sunset" } });
    expect(photo.findAll).toHaveBeenCalled();
    expect(searchHistory.create).toHaveBeenCalledWith({
      userId: 1,
      query: "sunset",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      photos: [
        {
          imageUrl: "https://images.unsplash.com/photo-123456",
          description: "Beautiful sunset",
          dateSaved: "2025-04-01T09:44:57.678Z",
          tags: ["sunset"],
        },
      ],
    });
  });

  test("should return error when searching with an invalid sort order", async () => {
    const req = { query: { tags: "summer", sort: "AESC" } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchPhotosByTag(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid sort order" });
  });

  test("should fetch search history", async () => {
    const mockHistory = [
      { query: "nature", createdAt: "2025-04-02T03:55:43.158Z" },
      { query: "landscape", createdAt: "2025-04-02T03:51:57.859Z" },
    ];
    searchHistory.findAll.mockResolvedValue(mockHistory);

    const req = { query: { userId: 1 } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await getSearchHistory(req, res);

    expect(searchHistory.findAll).toHaveBeenCalledWith({
      where: { userId: 1 },
      attributes: ["query", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      searchHistory: mockHistory.map((entry) => ({
        query: entry.query,
        timestamp: entry.createdAt,
      })),
    });
  });

  test("should return error while fetching search history without userId", async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await getSearchHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Valid userId is required.",
    });
  });
});

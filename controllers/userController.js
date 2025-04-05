const { User } = require("../models");

const {
  doesUserExist,
  validateUsername,
  validateEmail,
} = require("../services/userService");

//controller to create new user
const createNewUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validate if username is provided and is a non-empty string
    if (!validateUsername(username)) {
      return res.status(400).json({
        error: "Username is required and must be a non-empty string.",
      });
    }
    // Validate if email is in correct format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check if the user already exists in the database
    if (await doesUserExist(email)) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Create a new user in the database
    const newUser = await User.create({ username, email });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createNewUser };

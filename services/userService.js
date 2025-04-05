const { User } = require("../models");

// Function to check if a user exists by email
async function doesUserExist(email) {
  try {
    // Query the database to find a user with the given email
    const existingUser = await User.findOne({ where: { email } });
    return !!existingUser; // Returns true if user exists, false otherwise
  } catch (error) {
    console.error("Error checking user existence:", error);
    // Throw a generic error to prevent exposing database details
    throw new Error("Database query failed");
  }
}

// Function to validate the username
function validateUsername(username) {
  // Ensure username is a non-empty string
  return typeof username === "string" && username.trim().length > 0;
}

// Function to validate email format
function validateEmail(email) {
  // Regular expression to check if email has a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Ensure email is a string and matches the regex pattern
  return typeof email === "string" && emailRegex.test(email);
}

module.exports = { doesUserExist, validateUsername, validateEmail };

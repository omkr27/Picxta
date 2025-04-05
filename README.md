# Picxta

## Overview

Picxta is a photo curation application that allows users to search for images using the Unsplash API, save images, add tags, and retrieve search history. The application is built using **Node.js**, **Express**, **Sequelize**, **Supabase**, and integrates the **Unsplash API** for fetching images.

## Features

- **User Management**: Create new users and validate user details.
- **Image Search**: Search for images using the Unsplash API.
- **Photo Storage**: Save images with descriptions and tags.
- **Tagging System**: Assign tags to saved images for easy categorization.
- **Search History**: Store and retrieve user search history.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL), Sequelize ORM
- **API Integration**: Unsplash API
- **Testing**: Jest for unit and integration tests

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **NPM** or **Yarn**
- **Supabase Account**
- **Unsplash Developer Account**

### Steps to Set Up

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/picxta.git
   cd picxta
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add the following:
   ```env
   UNSPLASH_ACCESS_KEY=your_unsplash_api_key
   DATABASE_URL=your_supabase_database_url
   ```
4. Run database migrations:
   ```sh
   npx sequelize-cli db:migrate
   ```
5. Start the server:
   ```sh
   npm start
   ```
   The server should be running on `http://localhost:3000`.

## API Endpoints

### User Routes

- `POST /api/users` - Create a new user

### Photo Routes

- `GET /api/photos/search?query=<keyword>` - Search for images on Unsplash
- `POST /api/photos` - Save an image
- `POST /api/photos/:photoId/tags` - Add tags to an image
- `GET /api/photos/tag/search?tags=<tag>` - Search images by tag

### Search History Routes

- `GET /api/search-history?userId=<id>` - Retrieve user's search history

## Running Tests

To run tests, use:

```sh
npm test
```

## Contribution Guidelines

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Author

**Omkar Gawas**
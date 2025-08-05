# MERN Stack Backend

This is the backend server for the MERN stack application. It provides a RESTful API for the frontend to interact with the database.

## Features

- Express.js server
- MongoDB connection with Mongoose
- RESTful API endpoints
- Authentication middleware
- Error handling
- Environment variables configuration

## Folder Structure

```
/backend
  /config         - Configuration files
  /controllers    - Request handlers
  /middleware     - Custom middleware functions
  /models         - Mongoose schemas
  /routes         - API routes
  /uploads        - File storage
  .env            - Environment variables
  package.json    - Project dependencies
  server.js       - Entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern_app
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

4. Start the development server:

```bash
npm run dev
```

The server will run on http://localhost:5000 by default.

## API Endpoints

- `GET /api` - API status check

## Development

For development, the server uses nodemon to automatically restart when changes are detected.

```bash
npm run dev
```

## Production

For production, start the server with:

```bash
npm start
```
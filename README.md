# ClientManager - MERN Stack Client Management System

A comprehensive MERN (MongoDB, Express, React, Node.js) stack application designed for software development firms to manage client relationships, project proposals, and service delivery.

## Project Overview

ClientManager is a full-featured platform that streamlines the client management process for software development companies. The system facilitates client onboarding, project proposal submission, approval workflows, and post-project feedback collection.

## Key Features

### 1. Multi-step Client Registration & Verification

- **User Authentication**: JWT-based authentication with email/password login
- **Role-based Access**: Different access levels for admin and regular users
- **Form Validation**: Frontend validation using React state and custom hooks
- **Secure Routes**: Protected routes requiring authentication via middleware

### 2. Project Tracking & Status Management

- **CRUD Operations**: Complete project management with MongoDB/Mongoose
- **Real-time Updates**: State management using React Context API
- **Filtering & Search**: Dynamic project filtering by status and keywords
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### 3. Post-Completion Client Feedback

- **API Integration**: RESTful endpoints for feedback submission
- **Data Persistence**: MongoDB schema for storing feedback records
- **Form Components**: Reusable React components for feedback forms
- **Error Handling**: Comprehensive error management and display
## Project Structure

```
/
├── backend/                # Express server
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── uploads/           # File storage for client documents
│   ├── .env               # Environment variables
│   ├── package.json       # Dependencies
│   └── server.js          # Entry point
│
├── frontend/              # React application
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.js         # Main component
│   │   └── index.js       # Entry point
│   ├── .env               # Environment variables
│   └── package.json       # Dependencies
│
└── README.md              # Project documentation
```

## Technologies Used

### Backend
- Node.js & Express.js following MVC architecture
- MongoDB with Mongoose ODM
- JWT Authentication
- Multer for file uploads
- RESTful API architecture
- Model-View-Controller pattern implementation

### Frontend
- React with functional components and hooks
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd 470_MERN
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm start
```

The server will run on http://localhost:5000 by default.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
```

The application will run on http://localhost:3000 by default.

## Development

### Running Both Servers

You need to run both the backend and frontend servers simultaneously for the full application to work.

1. Terminal 1 (Backend):

```bash
cd backend
npm start
```

2. Terminal 2 (Frontend):

```bash
cd frontend
npm start
```

## User Roles

- **Admin**: Manages user verification, project approvals, and system settings
- **Project Manager**: Reviews project proposals and manages project workflow
- **Corporate Client**: Business entities seeking software development services
- **Individual Client**: Individual persons seeking software development services

## License

MIT
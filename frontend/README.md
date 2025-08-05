# MERN Stack Frontend

This is the frontend React application for the MERN stack project. It provides a user interface to interact with the backend API.

## Features

- React application with React Router
- Component-based architecture
- API service for backend communication
- Responsive design
- Basic styling with CSS

## Folder Structure

```
/frontend
  /public            - Static files
  /src
    /assets          - Images, fonts, etc.
    /components      - Reusable UI components
      /common        - Shared components
      /layout        - Layout components
    /config          - Application configuration
    /services        - API and service functions
    /utils           - Utility functions
    /views           - Page components
    App.js           - Main application component
    App.css          - Main styles
    index.js         - Application entry point
    index.css        - Global styles
  package.json       - Project dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables (optional):

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application will run on http://localhost:3000 by default.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from create-react-app

## Development

The application is set up with a proxy to the backend server in `package.json`. This allows you to make API calls without specifying the full URL:

```javascript
// Instead of
fetch('http://localhost:5000/api/users')

// You can use
fetch('/api/users')
```

## Building for Production

To build the application for production, run:

```bash
npm run build
# or
yarn build
```

This will create an optimized build in the `build` folder that can be deployed to a web server.
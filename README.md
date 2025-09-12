# ClientManager Pro: AI-Powered MERN Client & Project Management System

A comprehensive MERN (MongoDB, Express, React, Node.js) application for software development firms to manage client relationships, project proposals, and service delivery, now enhanced with a state-of-the-art **AI-driven RAG system**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Overview

ClientManager is a full-featured platform that streamlines the client management process for software development companies. The system facilitates client onboarding, project proposal submission, complex negotiation workflows, and post-project feedback from both parties.

The standout feature is its powerful **Retrieval Augmented Generation (RAG)** pipeline, allowing administrators to ingest entire GitHub repositories and interactively ask questions about the codebase, receiving AI-generated answers based on the project's actual source code.

## Key Features

### 1. Client Onboarding & Management
- **Multi-Step Registration**: A detailed onboarding process for corporate and individual clients, including document collection for company verification.
- **Client Dashboard**: Clients can view all their submitted projects, track their real-time status (e.g., pending, approved), and monitor progress.
- **Admin Verification**: A secure backend workflow for administrators to review and verify new client accounts.

### 2. Project Proposal & Negotiation Workflow
- **Detailed Project Submission**: Clients can submit comprehensive project proposals covering scope, technical requirements, timeline, and budget.
- **Negotiation & Counter-Offers**: A dynamic counter-offer system allowing both the client manager and the client to propose and respond to changes in budget, deadlines, and project scope.
- **Confirmation & Denial**: Clients can review the final proposal and formally confirm or deny the project.
- **PDF Contract Generation**: Admins can automatically generate professional PDF contracts from project data, which are then available for the client to download directly from their dashboard.

### 3. Advanced AI & RAG Integration
- **AI-Powered Project Tokenization**: Admins can automatically generate a detailed, structured Software Requirements Specification (SRS) in JSON format from a client's initial high-level proposal using Google's Gemini AI. This includes feature breakdowns, budget allocation, and technical requirements.
- **Automated Codebase Ingestion Pipeline**:
    - **Data Acquisition**: Uses `gitingest` to efficiently clone and preprocess any given GitHub repository, filtering for relevant source code files.
    - **Local Embeddings (Free & Private)**: Employs **Transformers.js** to run a state-of-the-art sentence-transformer model (`Xenova/all-MiniLM-L6-v2`) directly within the Node.js backend. This generates vector embeddings locally without any external paid APIs.
    - **Vector Storage**: Upserts the code chunks and their corresponding embeddings into a **Pinecone** serverless vector database, optimized for fast and scalable similarity search.
- **Interactive RAG Q&A System**:
    - **Semantic Search**: Admins can ask natural language questions about an ingested codebase (e.g., "How is user authentication handled?").
    - **Contextual Retrieval**: The system embeds the question and queries Pinecone to retrieve the most semantically relevant code snippets.
    - **AI-Powered Synthesis**: The retrieved code snippets are passed as context to a **Google Gemini 1.5 Flash** model, which generates a comprehensive, context-aware answer.

### 4. Communication & Post-Project Feedback
- **Live Chat System**: A direct, real-time communication channel between the client and the assigned client manager for seamless collaboration.
- **Dual-Feedback System**:
    - **Client to Company**: After project completion, clients can submit a detailed report/survey on their experience.
    - **Manager to Company**: Client managers can submit an internal-facing report on the client, providing valuable insights for future engagements.

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

## Technologies & Architecture

### Backend
- **Framework**: Node.js & Express.js
- **Architecture**: Model-View-Controller (MVC)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Uploads**: Multer
- **AI - Generation**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **AI - Embeddings**: Transformers.js (`@xenova/transformers`)
- **Vector Database**: Pinecone (`@pinecone-database/pinecone`)
- **Code Ingestion**: `gitingest` (Python library executed as a child process)

### Frontend
- **Framework**: React (with functional components and hooks)
- **Routing**: React Router
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **API Communication**: Axios

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Python (with `pip` for installing `gitingest`)
- MongoDB (local instance or a cloud service like Atlas)
- A Pinecone account for vector storage

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Install the `gitingest` Python package globally or in your active Python environment:
    ```bash
    pip install gitingest
    ```

4.  Create a `.env` file in the `backend` directory and add the following variables:
    ```dotenv
    # Server Configuration
    PORT=5000
    FRONTEND_URL=http://localhost:3000

    # Database & Auth
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key

    # AI & RAG System APIs
    GEMINI_API_KEY=your_google_ai_studio_api_key
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_INDEX_NAME=your_pinecone_index_name # e.g., radiant-hazel

    # GitHub Token (for gitingest to access private repos or get higher rate limits)
    GITHUB_TOKEN=your_github_personal_access_token
    ```

5.  Start the development server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000` by default.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `frontend` directory with the following variable:
    ```dotenv
    REACT_APP_SERVER_URL=http://localhost:5000
    ```

4.  Start the development server:
    ```bash
    npm start
    ```
    The application will run on `http://localhost:3000` by default.

## User Roles

- **Admin**: Manages user verification, project approvals, and can access the AI RAG system.
- **Project Manager**: Reviews project proposals and manages project workflow.
- **Corporate Client**: Business entities seeking software development services.
- **Individual Client**: Individual persons seeking software development services.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## API Endpoints

A high-level overview of the main API routes available. All routes are prefixed with `/api`.

| Method | Endpoint                                         | Description                                           | Access       |
|--------|--------------------------------------------------|-------------------------------------------------------|--------------|
| `POST` | `/users/register`                                | Register a new user.                                  | Public       |
| `POST` | `/users/login`                                   | Authenticate a user and get a JWT.                    | Public       |
| `GET`  | `/projects`                                      | Get a list of projects based on user role.            | Authenticated|
| `POST` | `/projects/draft`                                | Create a new project draft.                           | Client       |
| `GET`  | `/projects/:id`                                  | Get details for a specific project.                   | Owner/Admin  |
| `PATCH`| `/projects/:id/draft`                            | Update a project draft.                               | Owner        |
| `POST` | `/projects/:id/submit`                           | Submit a project for review.                          | Owner        |
| `POST` | `/projects/:id/generate-contract`                | Generate a PDF contract for the project.              | Admin        |
| `POST` | `/projects/:id/codebase/sync`                    | **[AI]** Preprocess a GitHub repo into a digest.      | Admin        |
| `POST` | `/projects/:id/codebase/ingest-pinecone`         | **[AI]** Ingest the digest into the vector database.    | Admin        |
| `POST` | `/projects/:id/codebase/ask`                     | **[AI]** Ask a question about the ingested codebase.    | Admin        |

## Future Work & Roadmap

This project serves as a strong foundation, with several exciting avenues for future development:

- [ ] **Expand RAG Capabilities**: Allow the RAG system to query multiple repositories or other knowledge sources (e.g., documentation websites).


## Contributing

Contributions are welcome! If you'd like to help improve ClientManager Pro, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork to your local machine.
3.  Create a new **branch** for your feature or bug fix (`git checkout -b feature/your-feature-name`).
4.  Make your changes and **commit** them with clear, descriptive messages.
5.  **Push** your changes to your fork on GitHub.
6.  Submit a **Pull Request** to the main repository's `main` branch.

Please ensure your code follows the existing style and that any new features are well-documented.



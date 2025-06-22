# Interact

Interact is a modern, web application for AI-powered text translation. It's built with a NestJS backend, Next.js frontend, and is fully containerized with Docker. Key features include user authentication, translation history, and multiple AI provider support (OpenAI & Groq).

## ✨ Features

-   **AI-Powered Translation**: Accurate, context-aware translations using OpenAI or Groq.
-   **User Authentication**: Secure JWT-based authentication and user accounts.
-   **Translation History**: Save, search, and manage your past translations.
-   **Customization**: Choose from multiple languages and translation styles.

## 🚀 Getting Started

This project is designed to be run with Docker.

### Prerequisites

-   Docker & Docker Compose

### 1. Clone the Repository

```bash
git clone <repository-url>
cd interact
```

### 2. Configure Environment

Copy the example environment file and add your AI API key.

```bash
cp /backend/env.example /backend/.env
```

Now, open the `/backend/.env` file and add your API key for either Groq (free, recommended for testing) or OpenAI.

```env
# in .env file

# For Groq (free) - get a key at https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# OR for OpenAI (paid)
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Application

This command will build the images and start the containers for the development environment.

```bash
docker-compose up --build -d
```

The application will be available at:
-   **Frontend**: `http://localhost:3000`
-   **Backend API**: `http://localhost:3001`
-   **API Docs (Swagger)**: `http://localhost:3001/api/docs`

## 🧪 Testing

To run tests, you can execute them directly inside the respective service's directory.

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## ⚙️ Production

A production-ready Docker Compose file (`docker-compose.prod.yml`) is included. Use it to build and run your application in a production environment.

```bash
# Build and run production containers in detached mode
docker-compose -f docker-compose.prod.yml up --build -d
```

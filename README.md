# Interact

Interact is a modern web application for AI-powered text translation. It features a NestJS backend, a Next.js frontend, and is fully containerized with Docker. Key features include user authentication, translation history, customizable translation styles, and support for multiple AI providers (OpenAI & Groq).

## ✨ Features

- **AI-Powered Translation**: Accurate, context-aware translations using OpenAI or Groq.
- **User Authentication**: Secure JWT-based authentication and user accounts.
- **Translation History**: Save, search, and manage your past translations.
- **Customization**: Choose from multiple languages and translation styles.
- **User Settings**: Personalize your translation experience.
- **Swagger API Docs**: Explore the backend API interactively.

## Installation

This project is designed to be run with Docker.

### Prerequisites

- Docker & Docker Compose

### 1. Clone the Repository

```bash
git clone <repository-url>
cd interact
```

### 2. Configure Environment

Copy the example environment file and add your AI API key (GROQ_API_KEY).

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
GROQ_API_KEY=TEST_GROQ_API_KEY
```

### 3. Run the Application

```bash
docker compose -f docker-compose.prod.yml up  -d --build
```

#### For development
```bash
# For development
docker compose up -d --build
```

## 🧪 Testing

To run tests, execute them inside the respective service's directory.

### Backend Tests
```bash
cd backend
npm install
npm test
```

### Frontend Tests
```bash
cd frontend
npm install
npm test
```

## 📝 License

MIT

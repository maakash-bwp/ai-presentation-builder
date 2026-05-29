# SlideCraft AI

Premium AI-powered presentation builder built with the MERN stack. SlideCraft AI helps users generate presentation outlines, stream slide content in real time, attach relevant visuals, edit slides inline, manage decks from a SaaS-style dashboard, and present or export finished work.

## Overview

This project is a full-stack web application with:

- A **React + Vite** frontend for dashboard, auth, AI workspace, slide editor, and presentation mode
- A **Node.js + Express + MongoDB** backend for authentication, presentations, AI orchestration, and image search
- **JWT authentication**, OTP-based email verification, password recovery, and Google sign-in
- **Streaming AI workflows** for outline and slide generation
- **Presentation management** features such as favorites, duplication, rename, delete, and recent decks

## Core Features

### Authentication

- Email/password signup and login
- Email verification with OTP
- Forgot password + OTP verification flow
- Google sign-in
- Profile update, password change, account deletion

### AI Presentation Workflow

- Generate presentation outlines from a prompt
- Stream outline generation in real time
- Generate slides from outline items
- Stream slide generation progressively
- Attach contextual slide visuals
- Choose from multiple presentation templates/themes

### Slide Editing

- Inline editing directly inside slide canvas
- Editable titles, bullet points, summaries, and layout content
- Slide duplication, deletion, insertion, and layout switching
- Presentation mode for fullscreen viewing

### Workspace & Dashboard

- Premium SaaS-style dashboard
- Presentations page with search and filtering
- Favorites page
- Templates page
- Profile and settings pages
- Recent presentations and workspace navigation

### Export & Presentation

- Present deck in fullscreen mode
- Export workflows integrated on the frontend
- Presentation-friendly themes and layouts

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Zustand
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer
- Express Validator
- Helmet
- Rate limiting

### AI / Content / Images

- Groq for text generation
- Optional Gemini / Ollama service integrations present in the backend
- Pexels / image provider pipeline for slide visuals

## Project Structure

```text
Presentat/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Key Routes

### Frontend Pages

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/verify-email`
- `/dashboard`
- `/presentations`
- `/favorites`
- `/templates`
- `/settings`
- `/profile`
- `/create`
- `/editor/:id`
- `/present/:id`

### Backend API

#### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-email`
- `POST /api/auth/verify-email/resend`
- `POST /api/auth/forgot-password`
- `POST /api/auth/forgot-password/verify`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/change-password`
- `DELETE /api/auth/me`

#### Presentations

- `GET /api/presentations`
- `POST /api/presentations`
- `GET /api/presentations/:id`
- `PUT /api/presentations/:id`
- `POST /api/presentations/:id/duplicate`
- `DELETE /api/presentations/:id`

#### AI

- `POST /api/ai/outline`
- `POST /api/ai/outline/stream`
- `POST /api/ai/slides`
- `POST /api/ai/slides/stream`
- `POST /api/ai/image`
- `GET /api/ai/image/proxy`

## Environment Variables

Create `.env` files in both `backend/` and `frontend/`.

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_presentation_builder
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
MONGO_CONNECT_TIMEOUT_MS=10000

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
PASSWORD_RESET_JWT_EXPIRES_IN=15m

CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
APP_BASE_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@example.com
SMTP_FROM_NAME=SlideCraft AI

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1/chat/completions

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
GEMINI_TIMEOUT_MS=60000

GOOGLE_CLIENT_ID=your_google_client_id

IMAGE_PROVIDER=hybrid
PEXELS_API_KEY=your_pexels_api_key
PEXELS_BASE_URL=https://api.pexels.com/v1
UNSPLASH_ACCESS_KEY=
UNSPLASH_BASE_URL=https://api.unsplash.com
CF_WORKER_IMAGE_URL=
CF_WORKER_API_KEY=

OTP_EXPIRES_IN_MINUTES=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running locally, or update `MONGO_URI` to your MongoDB Atlas connection string.

### 5. Run the backend

```bash
cd backend
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
npm test
npm run test:watch
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Production Notes

Before deploying:

- Replace development secrets with strong production values
- Use a managed MongoDB instance or Atlas
- Configure SMTP properly for OTP and verification emails
- Set the correct `CLIENT_ORIGIN`, `APP_BASE_URL`, and `VITE_API_BASE_URL`
- Rotate any credentials that were ever exposed during local development
- Verify Google OAuth origins for production domain

## GitHub Push Checklist

Before pushing this project publicly:

1. Make sure `.env` files are ignored
2. Do **not** commit API keys, SMTP passwords, JWT secrets, or database credentials
3. Add `.env.example` files for backend and frontend
4. Review `git status` carefully
5. Rotate any secrets that may already have been exposed

Recommended `.gitignore` entries:

```gitignore
node_modules
dist
build
.env
.env.*
!.env.example
coverage
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## Current Highlights

- Premium dark SaaS dashboard experience
- Functional presentations, favorites, templates, profile, and settings pages
- Inline editable slide canvas
- Auth flows with OTP and Google sign-in support
- Backend-ready AI orchestration and image pipeline integration

## Known Considerations

- AI and image quality depends on provider keys and provider availability
- SMTP must be configured correctly for OTP delivery
- Large frontend bundles can be further optimized with additional code splitting

## Future Enhancements

- Real-time collaboration
- Drag-and-drop slide reordering improvements
- More export formats and templates
- Voice narration
- Charts and data block generation
- Upload document to generate slides

## License

MIT

---

If you want, I can next create:

- a polished `backend/.env.example`
- a polished `frontend/.env.example`
- a professional `.gitignore`
- and the exact Git commands to push this repo to GitHub safely

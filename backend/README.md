# AI-Powered Presentation Builder (Backend)

Production-ready MERN backend for authentication, presentation CRUD, and AI-powered outline/slide/image generation.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication + bcrypt
- Gemini API integration for outline + slide text generation
- Unsplash image API with fallback image generation
- Jest + Supertest tests

## Folder Structure

```txt
backend/
  src/
    ai/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    validators/
  tests/
  server.js
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required in production:

- `MONGO_URI`
- `JWT_SECRET`

Optional:

- `UNSPLASH_ACCESS_KEY` (if empty, image endpoint returns fallback images)
- `GEMINI_API_KEY` (required for text generation endpoints)

## Install & Run

```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

Health check:

```bash
GET /api/health
```

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)

### Presentations (protected)

- `GET /api/presentations`
- `POST /api/presentations`
- `GET /api/presentations/:id`
- `PUT /api/presentations/:id`
- `DELETE /api/presentations/:id`

### AI (protected)

- `POST /api/ai/outline`
- `POST /api/ai/outline/stream`
- `POST /api/ai/slides`
- `POST /api/ai/slides/stream`
- `POST /api/ai/image`

## Example AI Outline Request

`POST /api/ai/outline`

```json
{
  "topic": "AI in Healthcare",
  "numberOfSlides": 6
}
```

## Testing

```bash
cd backend
npm test
```

Included tests cover:

- health + not found routes
- JWT utility behavior
- outline and slide parsing
- image service fallback/API behavior

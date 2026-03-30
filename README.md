# Smart Task Manager with AI Briefing

## 1. Overview

Smart Task Manager is a small full-stack monorepo built for a technical assignment.

It includes:

- a Node.js + Express API for task CRUD and AI-generated summaries
- a React single-page frontend for creating, listing, deleting, and briefing tasks
- PostgreSQL for persistence
- automated tests for both backend and frontend flows

The app supports a manual "Generate Briefing" flow. The frontend only calls the summary route when the user explicitly requests it.

## 2. Monorepo Structure

```text
apps/
  api/   Express + TypeScript backend
  web/   Vite + React frontend
```

Key directories:

- `apps/api/src` -> API source
- `apps/api/src/routes` -> Express routes
- `apps/api/src/controllers` -> request handlers
- `apps/api/src/services` -> task + AI logic
- `apps/api/src/db` -> Drizzle connection and schema
- `apps/web/src` -> frontend app source
- `apps/web/src/features/tasks` -> task feature UI, hooks, and API layer
- `apps/web/src/components` -> shared UI primitives
- `apps/web/src/test` -> frontend test setup

## 3. Tech Stack

### Backend

- Node.js
- TypeScript
- Express 5
- Zod
- Helmet
- CORS
- Drizzle ORM
- PostgreSQL

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- TanStack React Query
- Zod for runtime API response validation

### AI Integration

- Vercel AI SDK (`ai`)
- Google Generative AI provider (`@ai-sdk/google`)
- Gemini `gemini-2.5-flash`

### Tooling / Testing

- pnpm workspaces
- Vitest
- Supertest
- React Testing Library
- MSW
- Docker Compose

## 4. Features

- Create tasks with validation and trimmed titles
- List tasks ordered by newest first
- Delete tasks by UUID
- Generate an AI daily briefing from pending tasks
- Return a fallback briefing when AI generation fails
- Frontend confirmation modal before deleting a task
- Manual "Generate Briefing" button
- Runtime validation of frontend API response shapes with Zod

## 5. Prerequisites

- Node.js with Corepack enabled
- pnpm
- Docker and Docker Compose

## 6. Local Setup

### 1. Install dependencies

From the repository root:

```bash
corepack enable
pnpm install
```

### 2. Create environment files

#### Backend runtime env

```bash
cp apps/api/.env.example apps/api/.env
cp apps/api/.env.docker.example apps/api/.env.docker
```

Update `apps/api/.env` with a valid `GOOGLE_GENERATIVE_AI_API_KEY`.

#### Frontend runtime env

```bash
cp apps/web/.env.example apps/web/.env
```

Default frontend env:

```env
VITE_API_BASE_URL=http://localhost:4000
```

#### Backend test env

Create these two files for the API test database:

- `apps/api/.env.test`
- `apps/api/.env.docker.test`

Suggested `apps/api/.env.test`:

```env
PORT=4000
NODE_ENV=test
APP_STAGE=dev
DATABASE_URL=postgresql://myuser_test:mypassword_test@localhost:5433/smart_task_test
GOOGLE_GENERATIVE_AI_API_KEY=ASDF
```

Suggested `apps/api/.env.docker.test`:

```env
PROJECT_NAME=smart_task_test
DB_PORT=5433
DB_NAME=smart_task_test
DB_USER=myuser_test
DB_PASSWORD=mypassword_test
```

### 3. Start PostgreSQL

Start the main development database:

```bash
cd apps/api
docker compose --env-file .env.docker up -d
```

This starts PostgreSQL on `localhost:5432`.

If you want to run the backend tests locally, also start the test database:

```bash
cd apps/api
docker compose --env-file .env.docker.test up -d
```

This starts the test PostgreSQL instance on `localhost:5433`.

### 4. Run database migrations

From the repository root:

```bash
pnpm --dir apps/api db:migrate
```

### 5. Start the backend

From the repository root:

```bash
pnpm --dir apps/api dev
```

The API runs on:

```text
http://localhost:4000
```

### 6. Start the frontend

In a second terminal, from the repository root:

```bash
pnpm --dir apps/web dev
```

The Vite app runs on:

```text
http://localhost:3000
```

This matches the default backend CORS example:

```env
CORS_ORIGIN=http://localhost:3000
```

### 7. Open the app

- Frontend: `http://localhost:3000`
- API health check: `http://localhost:4000/health`

## 7. Environment Variables

### Backend: `apps/api/.env`

| Variable                       | Required | Description                                          |
| ------------------------------ | -------- | ---------------------------------------------------- |
| `NODE_ENV`                     | Yes      | Runtime mode: `development`, `production`, or `test` |
| `APP_STAGE`                    | Yes      | Application stage: `dev` or `prod`                   |
| `PORT`                         | Yes      | Backend port                                         |
| `CORS_ORIGIN`                  | Yes      | Allowed frontend origin(s), comma-separated          |
| `DATABASE_URL`                 | Yes      | PostgreSQL connection string                         |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes      | Gemini API key for AI-generated briefings            |

Example:

```env
NODE_ENV=development
APP_STAGE=dev
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/smart_task
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
```

### Frontend: `apps/web/.env`

| Variable            | Required | Description                  |
| ------------------- | -------- | ---------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL for the backend API |

Example:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## 8. Running Tests

### Frontend

```bash
pnpm --dir apps/web test
```

Frontend tests cover:

- initial task rendering
- manual briefing generation
- task creation flow
- task deletion flow
- delete-modal keyboard behavior
- graceful handling of API failures
- malformed-response handling via frontend Zod validation

### Backend

```bash
pnpm --dir apps/api test
```

Backend tests cover:

- `GET /health`
- `POST /tasks`
- `GET /tasks`
- `DELETE /tasks/:id`
- `GET /tasks/summary` empty-state behavior
- summary fallback behavior when AI generation fails

### Backend test database setup

If you have not already started the test database:

```bash
cd apps/api
docker compose --env-file .env.docker.test up -d
```

Then apply schema with either:

```bash
pnpm --dir apps/api test:db:push
```

or:

```bash
pnpm --dir apps/api test:db:migrate
```

## 9. API Overview

Base URL:

```text
http://localhost:4000
```

### `POST /tasks`

Create a task.

Request:

```json
{
  "title": "Finish frontend tests"
}
```

Response:

```json
{
  "data": {
    "task": {
      "id": "2c747f7d-f1fe-4ea9-a910-b4c3dc8a9a54",
      "title": "Finish frontend tests",
      "isCompleted": false,
      "createdAt": "2026-03-29T08:00:00.000Z"
    }
  }
}
```

### `GET /tasks`

Return all tasks ordered by newest first.

### `DELETE /tasks/:id`

Delete a task by UUID.

Response:

```http
204 No Content
```

### `GET /tasks/summary`

Generate a short briefing for pending tasks.

Example response:

```json
{
  "data": {
    "summary": "Start with Finish frontend tests, then move to Review API errors.",
    "pendingTasksCount": 2
  },
  "meta": {
    "source": "ai"
  }
}
```

Empty-state response:

```json
{
  "data": {
    "summary": "You have no pending tasks.",
    "pendingTasksCount": 0
  }
}
```

## 10. Frontend Notes

- The user must click `Generate Briefing` to call `GET /tasks/summary`.
- The delete action is guarded by a confirmation modal.
- API response shapes are validated at runtime before the UI uses them.

## 11. AI Behavior

The backend sends pending tasks to Gemini through the Vercel AI SDK and asks for:

- the most impactful tasks
- what to start with first
- a short response under five sentences
- an actionable tone

If the provider throws, the API falls back to a local deterministic summary builder and returns `meta.source = "fallback"`.

## 12. Trade-offs / Future Improvements

- The task model is intentionally simple.
- There is no authentication or per-user task ownership.
- Task completion updates are not yet exposed via the current API.
- The frontend and backend contracts are not yet extracted into a shared monorepo package.
- Observability is limited to application logs.

## 13. Useful Commands

From the repository root:

```bash
pnpm --dir apps/api dev
pnpm --dir apps/web dev
pnpm --dir apps/api test
pnpm --dir apps/web test
pnpm --dir apps/api db:migrate
```

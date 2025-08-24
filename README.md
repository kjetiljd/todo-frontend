# Todo Frontend

Vue.js 3 frontend application for the todo list demo.

## Features

- Add, edit, delete todos
- Mark todos as complete/incomplete
- Filter todos (all, active, completed)
- Sort todos by various criteria
- Responsive design with Tailwind CSS

## Tech Stack

- Vue.js 3 with Composition API
- TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Axios for API calls

## Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Start with built-in mock API (no backend required)
VITE_USE_MOCK_API=true npm run dev

# Override backend target (defaults to http://localhost:8080)
VITE_API_TARGET=http://localhost:8081 npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## API Integration

The frontend communicates with:
- Todo API (http://localhost:8080) - Main CRUD operations
- Sorting Service (via Todo API) - For sorting functionality

## Configuration

The Vite development server proxies `/api` requests to `http://localhost:8080` by default.
You can control this via env variables at dev time:

- `VITE_API_TARGET` – change proxy target, e.g. `VITE_API_TARGET=http://localhost:8081 npm run dev`.
- `VITE_USE_MOCK_API` – when set to `true`, enables an in-memory mock API served by Vite under `/api`.
  This is useful if the real backend isn’t running. Example: `VITE_USE_MOCK_API=true npm run dev`.

## Troubleshooting

- Proxy ECONNREFUSED at `/api/...` during dev
  - Cause: Backend at the configured target isn’t running.
  - Fix: Start the backend at the expected port, set `VITE_API_TARGET` to the correct URL, or run with `VITE_USE_MOCK_API=true`.

- DeprecationWarning: util._extend
  - This warning comes from a transitive dependency used by the dev proxy. It’s harmless.
  - You can ignore it, use Node LTS (e.g. 20.x), or upgrade tooling when available.

## Docker

Build the production image (multi-stage: Node build + Nginx serve):

```bash
docker build -t todo-frontend .
```

Run it (serves on http://localhost:8080):

```bash
# Backend on the host at port 8080 (macOS/Windows Docker Desktop)
docker run --rm -p 8080:80 -e API_URL=http://host.docker.internal:8080 todo-frontend

# If backend is another container on the same user-defined network
# docker network create appnet
# docker run -d --name backend --network appnet -p 8080:8080 your-backend
# then:
# docker run --rm --network appnet -p 8080:80 -e API_URL=http://backend:8080 todo-frontend
```

Notes:
- API_URL configures Nginx to proxy /api to your backend (default http://localhost:8080).
- The container serves the built app from Nginx; use Vite dev + mock API for local development.

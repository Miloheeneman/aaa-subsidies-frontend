# AAA-Subsidies — Frontend

React + Vite + Tailwind frontend for the AAA-Subsidies platform.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Run (development)

```bash
npm run dev
```

Opens on `http://localhost:5173`.

The dev server proxies `/api` to `http://localhost:8000` (the FastAPI backend),
and the axios client uses `VITE_API_URL` from `.env` when set.

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

- Framework preset: Vite
- Build command: `npm run build`
- Output: `dist`
- Environment variable: `VITE_API_URL=https://<railway-backend>/api/v1`

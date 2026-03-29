# IPL-PREDICTION

Binary Prediction App is a clean full-stack MVP built with React + Vite + Tailwind CSS on the frontend, and Express + MongoDB on the backend.

## Folder structure

- `/client`: React + Vite frontend
- `/server`: Express API with Mongoose models

## Setup

1. Install backend dependencies

```bash
cd server
npm install
```

2. Install frontend dependencies

```bash
cd ../client
npm install
```

3. Configure backend environment

Create a `.env` file inside `/server` using the example:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/binary-prediction
```

4. Start the backend

```bash
cd server
npm run dev
```

5. Start the frontend

```bash
cd client
npm run dev
```

## API Endpoints

- `POST /api/questions` — create a new question
- `GET /api/questions` — list all questions
- `POST /api/vote` — cast a vote (prevents duplicate user votes)
- `GET /api/results/:id` — get vote totals and percentages

## Notes

- The frontend stores vote state locally in `localStorage`
- The backend protects duplicate voting by `userIdentifier` per question
- Tailwind styling delivers a dark, responsive UI with animated result bars

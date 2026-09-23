# Prompt App

Simple full-stack application to manage prompts.

## Features

- User registration and login
- Create prompts
- View prompts
- Update prompts
- Delete prompts
- Filter prompts by tags
- Search in prompt title and body
- Case-insensitive search
- Tag list
- JSON file storage
- Copy prompt to clipboard

## Tech Stack

Frontend:
- HTML
- CSS
- TypeScript
- Vite

Backend:
- Node.js
- TypeScript
- Express
- Zod
- bcrypt
- express-session

Storage:
- JSON files

Testing:
- Vitest
- Supertest

## Project Structure

```text
backend/
  auth.ts
  prompts.ts
  server.ts
  storage.ts

data/
  prompts.json
  users.json

frontend/
  index.html
  login.html
  main.ts
  prompt.html
  style.css

tests/
  prompts.test.ts
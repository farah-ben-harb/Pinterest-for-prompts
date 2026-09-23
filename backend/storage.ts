import fs from "node:fs/promises";
import path from "node:path";

export interface Prompt {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const promptsPath = path.join(
  process.cwd(),
  "data",
  "prompts.json"
);

const usersPath = path.join(
  process.cwd(),
  "data",
  "users.json"
);

async function readJson<T>(filePath: string): Promise<T> {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data) as T;
}

async function writeJson<T>(
  filePath: string,
  data: T
): Promise<void> {
  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function getPrompts(): Promise<Prompt[]> {
  return readJson<Prompt[]>(promptsPath);
}

export async function savePrompts(
  prompts: Prompt[]
): Promise<void> {
  await writeJson(promptsPath, prompts);
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(usersPath);
}

export async function saveUsers(
  users: User[]
): Promise<void> {
  await writeJson(usersPath, users);
}
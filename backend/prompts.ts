import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  getPrompts,
  savePrompts
} from "./storage";

import type { Prompt } from "./storage";

import { requireAuth } from "./auth";

export const promptsRouter = Router();

promptsRouter.use(requireAuth);

const promptSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  tags: z
    .array(z.string().trim().min(1))
    .default([])
});

function getUserId(req: any): string {
  return req.session.userId;
}

function normalizeTags(tags: string[]): string[] {
  return [
    ...new Set(
      tags.map((tag) =>
        tag.trim().toLowerCase()
      )
    )
  ];
}

promptsRouter.post("/", async (req, res) => {
  const result = promptSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid prompt"
    });
  }

  const prompts = await getPrompts();

  const now = new Date().toISOString();

  const prompt: Prompt = {
    id: randomUUID(),
    title: result.data.title,
    body: result.data.body,
    tags: normalizeTags(result.data.tags),
    authorId: getUserId(req),
    createdAt: now,
    updatedAt: now
  };

  prompts.push(prompt);

  await savePrompts(prompts);

  return res.status(201).json(prompt);
});

promptsRouter.get("/", async (req, res) => {
  let prompts = await getPrompts();

  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim().toLowerCase()
      : "";

  const tag =
    typeof req.query.tag === "string"
      ? req.query.tag.trim().toLowerCase()
      : "";

  if (search) {
    prompts = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(search) ||
      prompt.body.toLowerCase().includes(search)
    );
  }

  if (tag) {
    prompts = prompts.filter((prompt) =>
      prompt.tags.some(
        (promptTag) =>
          promptTag.toLowerCase() === tag
      )
    );
  }

  return res.json(prompts);
});

promptsRouter.get("/:id", async (req, res) => {
  const prompts = await getPrompts();

  const prompt = prompts.find(
    (prompt) => prompt.id === req.params.id
  );

  if (!prompt) {
    return res.status(404).json({
      error: "Prompt not found"
    });
  }

  return res.json(prompt);
});

promptsRouter.put("/:id", async (req, res) => {
  const result = promptSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid prompt"
    });
  }

  const prompts = await getPrompts();

  const index = prompts.findIndex(
    (prompt) => prompt.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Prompt not found"
    });
  }

  const prompt = prompts[index]!;

  if (prompt.authorId !== getUserId(req)) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  const updatedPrompt: Prompt = {
    ...prompt,
    title: result.data.title,
    body: result.data.body,
    tags: normalizeTags(result.data.tags),
    updatedAt: new Date().toISOString()
  };

  prompts[index] = updatedPrompt;

  await savePrompts(prompts);

  return res.json(updatedPrompt);
});

promptsRouter.delete("/:id", async (req, res) => {
  const prompts = await getPrompts();

  const index = prompts.findIndex(
    (prompt) => prompt.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Prompt not found"
    });
  }

  const prompt = prompts[index]!;

  if (prompt.authorId !== getUserId(req)) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  prompts.splice(index, 1);

  await savePrompts(prompts);

  return res.status(204).send();
});
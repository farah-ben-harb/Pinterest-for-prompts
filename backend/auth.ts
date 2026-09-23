import { Router } from "express";

import type {
  Request,
  Response,
  NextFunction
} from "express";

import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  getUsers,
  saveUsers
} from "./storage";

import type { User } from "./storage";

export const authRouter = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function getSession(req: Request) {
  return req.session as typeof req.session & {
    userId?: string;
  };
}

authRouter.post("/register", async (req, res) => {
  const result = authSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid email or password"
    });
  }

  const email = result.data.email
    .trim()
    .toLowerCase();

  const password = result.data.password;

  const users = await getUsers();

  const existingUser = users.find(
    (user) => user.email === email
  );

  if (existingUser) {
    return res.status(409).json({
      error: "Email already registered"
    });
  }

  const passwordHash = await bcrypt.hash(
    password,
    10
  );

  const user: User = {
    id: randomUUID(),
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  await saveUsers(users);

  const session = getSession(req);

  session.userId = user.id;

  return res.status(201).json({
    id: user.id,
    email: user.email
  });
});

authRouter.post("/login", async (req, res) => {
  const result = authSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid email or password"
    });
  }

  const email = result.data.email
    .trim()
    .toLowerCase();

  const password = result.data.password;

  const users = await getUsers();

  const user = users.find(
    (user) => user.email === email
  );

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const passwordIsCorrect =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!passwordIsCorrect) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const session = getSession(req);

  session.userId = user.id;

  return res.json({
    id: user.id,
    email: user.email
  });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
});

authRouter.get("/me", async (req, res) => {
  const session = getSession(req);

  if (!session.userId) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  const users = await getUsers();

  const user = users.find(
    (user) => user.id === session.userId
  );

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  return res.json({
    id: user.id,
    email: user.email
  });
});

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = getSession(req);

  if (!session.userId) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  next();
}
import express from "express";
import session from "express-session";
import cors from "cors";

import { authRouter } from "./auth";
import { promptsRouter } from "./prompts";
import { getPrompts } from "./storage";

const app = express();

const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "development-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);
app.use("/api/auth", authRouter);
app.use("/api/prompts", promptsRouter);

app.get("/api/tags", async (req, res) => {
  const prompts = await getPrompts();

  const tags = [
    ...new Set(
      prompts.flatMap((prompt) => prompt.tags)
    )
  ].sort();

  return res.json(tags);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
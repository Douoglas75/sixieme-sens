import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure data file exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: {} }));
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "2.0.0", timestamp: new Date().toISOString() });
  });

  app.post("/api/user/save", async (req, res) => {
    const { userId, data } = req.body;
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf-8");
      const db = JSON.parse(fileContent);
      db.users[userId] = data;
      await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.get("/api/user/load/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf-8");
      const db = JSON.parse(fileContent);
      res.json({ data: db.users[userId] || null });
    } catch (e) {
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  app.post("/api/tasks/request", async (req, res) => {
    const { userId, taskType } = req.body;
    // Simulate AI processing
    setTimeout(async () => {
      console.log(`AI Task processed for ${userId}: ${taskType}`);
    }, 5000);
    res.json({ success: true, message: "Task requested and being processed by Ghost-Admin" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

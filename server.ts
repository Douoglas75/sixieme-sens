import express, { Request } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { google } from "googleapis";
import axios from "axios";
import cookieParser from "cookie-parser";
import session from "express-session";

// Extend Request type for sessions
interface SessionRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    googleTokens?: any;
    spotifyTokens?: any;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

// OAuth Config
const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: `${process.env.APP_URL}/api/auth/google/callback`
};

const SPOTIFY_CONFIG = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirect: `${process.env.APP_URL}/api/auth/spotify/callback`
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: "6s-intuition-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: 'none', httpOnly: true }
  }));

  // Ensure data file exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: {}, tokens: {} }));
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "2.0.0", timestamp: new Date().toISOString() });
  });

  // --- GOOGLE OAUTH ---
  const createGoogleClient = () => new google.auth.OAuth2(
    GOOGLE_CONFIG.clientId,
    GOOGLE_CONFIG.clientSecret,
    GOOGLE_CONFIG.redirect
  );

  app.get("/api/auth/google/url", (req, res) => {
    const client = createGoogleClient();
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.body.read"
      ],
      prompt: "consent"
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req: Request, res) => {
    const { code } = req.query;
    const client = createGoogleClient();
    try {
      const { tokens } = await client.getToken(code as string);
      (req as SessionRequest).session.googleTokens = tokens;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentification Google réussie. Fermeture...</p>
          </body>
        </html>
      `);
    } catch (e) {
      res.status(500).send("Erreur lors de l'authentification Google");
    }
  });

  // --- SPOTIFY OAUTH ---
  app.get("/api/auth/spotify/url", (req, res) => {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId!,
      response_type: "code",
      redirect_uri: SPOTIFY_CONFIG.redirect,
      scope: "user-read-recently-played user-top-read user-read-playback-state"
    });
    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get("/api/auth/spotify/callback", async (req: Request, res) => {
    const { code } = req.query;
    try {
      const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: SPOTIFY_CONFIG.redirect,
        client_id: SPOTIFY_CONFIG.clientId!,
        client_secret: SPOTIFY_CONFIG.clientSecret!
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      (req as SessionRequest).session.spotifyTokens = response.data;

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'spotify' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentification Spotify réussie. Fermeture...</p>
          </body>
        </html>
      `);
    } catch (e) {
      res.status(500).send("Erreur lors de l'authentification Spotify");
    }
  });

  // --- REAL DATA FETCHING ---
  app.get("/api/data/google/calendar", async (req: Request, res) => {
    const tokens = (req as SessionRequest).session.googleTokens;
    if (!tokens) return res.status(401).json({ error: "Non connecté à Google" });

    const client = createGoogleClient();
    client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: client });

    try {
      const events = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
      res.json(events.data.items);
    } catch (e) {
      res.status(500).json({ error: "Erreur Calendar" });
    }
  });

  app.get("/api/data/spotify/recent", async (req: Request, res) => {
    const tokens = (req as SessionRequest).session.spotifyTokens;
    if (!tokens) return res.status(401).json({ error: "Non connecté à Spotify" });

    try {
      const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      res.json(response.data.items);
    } catch (e) {
      res.status(500).json({ error: "Erreur Spotify" });
    }
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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

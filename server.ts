import crypto from "crypto";
import express, { Request } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { google } from "googleapis";
import axios from "axios";
import cookieParser from "cookie-parser";
import session from "express-session";
import { GoogleGenAI } from "@google/genai";

// Extend Request type for sessions
interface SessionRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    googleTokens?: any;
    spotifyTokens?: any;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = process.env.VERCEL 
  ? "/tmp/data.json" 
  : path.join(__dirname, "data.json");

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

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const PLAID_CONFIG = {
  clientId: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: process.env.PLAID_ENV || 'sandbox'
};

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[PLAID_CONFIG.env],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CONFIG.clientId,
      'PLAID-SECRET': PLAID_CONFIG.secret,
    },
  },
}));

const ai_server = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify({ users: {}, tokens: {} }));
    } catch (e) {
      console.error("Failed initializing database", e);
    }
  }
}

async function saveTokens(userId: string, provider: 'google' | 'spotify', tokens: any) {
  try {
    await ensureDataFile();
    const fileContent = await fs.readFile(DATA_FILE, "utf-8");
    const db = JSON.parse(fileContent);
    if (!db.tokens) db.tokens = {};
    if (!db.tokens[userId]) db.tokens[userId] = {};
    db.tokens[userId][provider] = tokens;
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Failed to save tokens", e);
  }
}

async function getTokens(userId: string, provider: 'google' | 'spotify') {
  try {
    await ensureDataFile();
    const fileContent = await fs.readFile(DATA_FILE, "utf-8");
    const db = JSON.parse(fileContent);
    return db.tokens?.[userId]?.[provider] || null;
  } catch (e) {
    console.error("Failed to load tokens", e);
    return null;
  }
}

const app = express();
const PORT = 3000;
const IS_PROD = !!process.env.VERCEL || process.env.NODE_ENV === "production";

// Le secret de session doit venir de l'environnement (jamais en dur dans le code)
const SESSION_SECRET = process.env.SESSION_SECRET || (IS_PROD ? "" : "dev-only-secret");
if (!SESSION_SECRET) throw new Error("SESSION_SECRET manquant : à définir dans les variables d'environnement Vercel");

app.set("trust proxy", 1);

// L'identité de l'utilisateur vient de la session serveur, JAMAIS du client
function getUid(req: Request): string {
  const s = (req as any).session;
  if (!s.uid) s.uid = crypto.randomUUID();
  return s.uid;
}

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: IS_PROD, sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

// Initialize database file
ensureDataFile();

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
    const nonce = crypto.randomBytes(16).toString("hex");
    (req as any).session.oauthState = nonce;
    getUid(req);
    const client = createGoogleClient();
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.body.read"
      ],
      prompt: "consent",
      state: nonce
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req: Request, res) => {
    const { code, state } = req.query;
    const sess = (req as any).session;
    if (!state || state !== sess.oauthState) return res.status(400).send("État OAuth invalide");
    sess.oauthState = undefined;
    const userId = getUid(req);
    const client = createGoogleClient();
    try {
      const { tokens } = await client.getToken(code as string);
      (req as SessionRequest).session.googleTokens = tokens;
      await saveTokens(userId, 'google', tokens);
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google' }, window.location.origin);
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
    const nonce = crypto.randomBytes(16).toString("hex");
    (req as any).session.oauthState = nonce;
    getUid(req);
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId!,
      response_type: "code",
      redirect_uri: SPOTIFY_CONFIG.redirect,
      scope: "user-read-recently-played user-top-read user-read-playback-state",
      state: nonce
    });
    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get("/api/auth/spotify/callback", async (req: Request, res) => {
    const { code, state } = req.query;
    const sess = (req as any).session;
    if (!state || state !== sess.oauthState) return res.status(400).send("État OAuth invalide");
    sess.oauthState = undefined;
    const userId = getUid(req);
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
      await saveTokens(userId, 'spotify', response.data);

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'spotify' }, window.location.origin);
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
    let tokens = (req as SessionRequest).session.googleTokens;
    if (!tokens) {
      tokens = await getTokens(getUid(req), "google");
    }
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

  app.get("/api/data/google/fit", async (req: Request, res) => {
    let tokens = (req as SessionRequest).session.googleTokens;
    if (!tokens) {
      tokens = await getTokens(getUid(req), "google");
    }
    if (!tokens) return res.status(401).json({ error: "Non connecté à Google Fit" });

    const client = createGoogleClient();
    client.setCredentials(tokens);
    const fitness = google.fitness({ version: "v1", auth: client });

    try {
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTimeMillis = startOfDay.getTime();

      const result = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [{
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
          }],
          bucketByTime: { durationMillis: (now - startTimeMillis).toString() },
          startTimeMillis: startTimeMillis.toString(),
          endTimeMillis: now.toString()
        }
      });

      let steps = 0;
      if (result.data.bucket && result.data.bucket[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal) {
        steps = result.data.bucket[0].dataset[0].point[0].value[0].intVal;
      }
      res.json({ steps });
    } catch (e: any) {
      console.warn("Google Fit fetch failed:", e.message);
      res.status(502).json({ error: "Google Fit indisponible" });
    }
  });

  app.get("/api/data/spotify/recent", async (req: Request, res) => {
    let tokens = (req as SessionRequest).session.spotifyTokens;
    if (!tokens) {
      tokens = await getTokens(getUid(req), "spotify");
    }
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

  // --- WEATHER DATA ---
  app.get("/api/data/weather", async (req, res) => {
    if (!WEATHER_API_KEY) return res.status(503).json({ error: "Clé Weather non configurée" });
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitude et Longitude requises" });

    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`);
      res.json(response.data);
    } catch (e) {
      res.status(500).json({ error: "Erreur Météo" });
    }
  });

  // --- PLAID (BANKING) ---
  app.post("/api/auth/plaid/create-link-token", async (req, res) => {
    if (!PLAID_CONFIG.clientId || !PLAID_CONFIG.secret) {
      return res.status(503).json({ error: "Configuration Plaid manquante" });
    }

    try {
      const tokenResponse = await plaidClient.linkTokenCreate({
        user: { client_user_id: getUid(req) },
        client_name: '6S Intuition',
        products: [Products.Transactions],
        country_codes: [CountryCode.Fr],
        language: 'fr',
      });
      res.json(tokenResponse.data);
    } catch (e: any) {
      console.error("Erreur Plaid:", e.response?.data || e.message);
      res.status(500).json({ error: "Impossible de générer le jeton de connexion bancaire" });
    }
  });

  app.post("/api/user/save", async (req, res) => {
    const userId = getUid(req);
    const { data } = req.body;
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
    const userId = getUid(req);
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf-8");
      const db = JSON.parse(fileContent);
      res.json({ data: db.users[userId] || null });
    } catch (e) {
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  app.get("/api/apps/status", async (req, res) => {
    const userId = getUid(req);
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf-8");
      const db = JSON.parse(fileContent);
      const userTokens = db.tokens?.[userId] || {};
      
      const sessionGoogle = (req as SessionRequest).session.googleTokens;
      const sessionSpotify = (req as SessionRequest).session.spotifyTokens;

      res.json({
        google: !!(userTokens.google || sessionGoogle),
        spotify: !!(userTokens.spotify || sessionSpotify),
        weather: !!WEATHER_API_KEY,
        plaid: !!(PLAID_CONFIG.clientId && PLAID_CONFIG.secret)
      });
    } catch (e) {
      res.json({ google: false, spotify: false, weather: !!WEATHER_API_KEY, plaid: false });
    }
  });

  // Sentinelle : aucune alerte inventée. Tant qu'une source réelle (trafic Google, vigilance Météo-France)
  // n'est pas branchée, on renvoie une liste vide, clairement signalée comme indisponible.
  app.get("/api/data/location/safety-alerts", (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitude et longitude requises" });
    res.json({ alerts: [], source: "unavailable" });
  });

  // Vite middleware for development (Skip inside running Serverless instances on Vercel)
  if (!process.env.VERCEL) {
    (async () => {
      if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
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
    })();
  }

export default app;

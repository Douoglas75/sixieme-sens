import { GoogleGenAI, Type } from "@google/genai";
import { User, Alert, Prediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePersonalizedInsights(user: User, weather?: any, banking?: any): Promise<{ alerts: Alert[], predictions: Prediction[] }> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using fallback logic.");
    return generateFallbackInsights(user);
  }

  const prompt = `
    En tant qu'IA "Ghost-Admin" du système Sixième Sens (6S), analyse le profil utilisateur suivant et génère des alertes et prédictions UNIQUEMENT basées sur les données réelles fournies.
    
    IMPORTANT : Ne simule pas de données financières si aucune donnée de compte bancaire n'est présente. Ne simule pas de données de santé si le sommeil ou l'activité sont aux valeurs par défaut.
    
    Données Environnementales (Météo/Air):
    ${weather ? JSON.stringify(weather) : 'Non disponible'}
    
    Données Financières (Plaid):
    ${banking ? JSON.stringify(banking) : 'Non disponible'}
    
    Profil Utilisateur:
    - Sommeil: ${user.sleep}h/nuit (Défaut: 7h)
    - Activité: ${user.activity} (Défaut: medium)
    - Finance: ${user.finance} (Défaut: ok)
    - Contacts clés: ${user.contacts.length > 0 ? user.contacts.map(c => `${c.name} (${c.relation}, dernier contact il y a ${c.lastContact} jours)`).join(', ') : 'Aucun contact synchronisé'}
    
    L'éthique de l'app est futuriste, cyberpunk, protectrice et ultra-efficace.
    Les alertes doivent être concrètes, immédiates et VÉRIDIQUES.
    Si la météo est mauvaise ou l'air pollué, génère une alerte de type "red" ou "yellow" avec des conseils de santé.
    Si des transactions bancaires suspectes ou des soldes bas sont détectés, génère une alerte "Wallet".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["red", "yellow", "green"] },
                  icon: { type: Type.STRING, enum: ["HeartPulse", "Wallet", "Zap"] },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  time: { type: Type.STRING },
                  actions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["type", "icon", "title", "desc", "time", "actions"]
              }
            },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["health", "finance", "social", "cognitive"] },
                  cat: { type: Type.STRING },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  conf: { type: Type.NUMBER },
                  tl: { type: Type.STRING },
                  rec: { type: Type.STRING },
                  cd: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["id", "type", "cat", "title", "desc", "conf", "tl", "rec", "cd"]
              }
            }
          },
          required: ["alerts", "predictions"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return generateFallbackInsights(user);
  }
}

function generateFallbackInsights(user: User): { alerts: Alert[], predictions: Prediction[] } {
  const alerts: Alert[] = [];
  
  // Only show sleep alert if it's a real deviation (not default 7h)
  if (user.sleep !== 7 && user.sleep < 6) {
    alerts.push({
      type: 'red',
      icon: 'HeartPulse',
      title: 'Déficit de récupération',
      desc: 'Votre cycle de sommeil est critique. Risque de baisse cognitive détecté.',
      time: 'Urgent',
      actions: ['Mode Sommeil', 'Détails']
    });
  }
  
  // Default welcome alert if no other alerts
  if (alerts.length === 0) {
    alerts.push({
      type: 'green',
      icon: 'Zap',
      title: 'Système 6S Opérationnel',
      desc: 'En attente de synchronisation de données pour analyse prédictive.',
      time: 'À l\'instant',
      actions: ['Lier des apps']
    });
  }

  const predictions: Prediction[] = [];
  if (user.contacts.length > 0) {
    predictions.push({
      id: 'p1',
      type: 'social',
      cat: 'Social',
      title: 'Optimisation Réseau',
      desc: 'Basé sur votre fréquence de contact actuelle.',
      conf: 75,
      tl: '7 jours',
      rec: 'Maintenez le rythme avec vos contacts clés.',
      cd: [70, 72, 75, 73, 75, 78, 80, 75]
    });
  }

  return { alerts, predictions };
}

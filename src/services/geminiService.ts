import { GoogleGenAI, Type } from "@google/genai";
import { User, Alert, Prediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePersonalizedInsights(user: User): Promise<{ alerts: Alert[], predictions: Prediction[] }> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using fallback logic.");
    return generateFallbackInsights(user);
  }

  const prompt = `
    En tant qu'IA "Ghost-Admin" du système Sixième Sens (6S), analyse le profil utilisateur suivant et génère 3 alertes prédictives et 2 prédictions à long terme.
    
    Profil:
    - Sommeil: ${user.sleep}h/nuit
    - Activité: ${user.activity}
    - Finance: ${user.finance}
    - Contacts clés: ${user.contacts.map(c => `${c.name} (${c.relation}, dernier contact il y a ${c.lastContact} jours)`).join(', ')}
    
    L'éthique de l'app est futuriste, cyberpunk, protectrice et ultra-efficace.
    Les alertes doivent être concrètes et immédiates.
    Les prédictions doivent inclure des données chiffrées (confiance, timeline).
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
  // Fallback logic if API fails or key is missing
  const alerts: Alert[] = [];
  if (user.sleep < 7) {
    alerts.push({
      type: 'red',
      icon: 'HeartPulse',
      title: 'Déficit de récupération',
      desc: 'Votre cycle de sommeil est critique. Risque de baisse cognitive de 20% demain.',
      time: 'Urgent',
      actions: ['Mode Sommeil', 'Détails']
    });
  }
  
  alerts.push({
    type: 'green',
    icon: 'Zap',
    title: 'Optimisation Attentionnelle',
    desc: 'Votre pic de dopamine est prévu dans 45 minutes.',
    time: '10:45',
    actions: ['Deep Focus', 'Ignorer']
  });

  const predictions: Prediction[] = [
    {
      id: 'p1',
      type: 'health',
      cat: 'Santé',
      title: 'Risque Burnout J+14',
      desc: 'Basé sur la corrélation sommeil/activité.',
      conf: 88,
      tl: '14 jours',
      rec: 'Réduire la charge cognitive de 15%.',
      cd: [80, 75, 70, 65, 60, 55, 50, 45]
    }
  ];

  return { alerts, predictions };
}

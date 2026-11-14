# Sixième Sens (6S) — Feuille de route

Règle : on avance dans l'ordre. Dire « continue » = lancer la prochaine étape non cochée.
Coût : 🟢 léger · 🟡 moyen · 🔴 lourd (à garder pour la fin)

## Phase 0 — Config & sécurité 🟢
- [x] index.html : manifest, chemin /src/main.tsx, titre unifié, viewport-fit
- [x] manifest.webmanifest, sw.js minimal (hors-ligne, jamais de cache /api)
- [x] vercel.json : CSP + en-têtes fusionnés, rewrites simplifiés, COOP compatible OAuth Google
- [x] vite.config.ts : clé GEMINI_API_KEY retirée du bundle client (faille)
- [x] package.json : `start` corrigé, vite en devDependencies, nom du projet
- [ ] À faire par toi : régénérer la clé Gemini (elle a pu être exposée), l'ajouter dans les variables Vercel
- [ ] À faire par toi : fournir icon-512.png, src/, api/index.ts, server.ts à jour, app.js

## Phase 0.5 — Audit serveur 🟢 (fait)
- [x] Secret de session en variable d'environnement (SESSION_SECRET à créer sur Vercel)
- [x] Identité utilisateur issue de la session, plus du client (faille : lecture/écriture des données de n'importe qui)
- [x] Fin du compte partagé « default_user » pour les jetons Google/Spotify
- [x] État OAuth anti-CSRF + postMessage limité à notre domaine
- [x] Scope Gmail retiré (inutile, sensible)
- [x] Faux pas Google Fit et fausses alertes IA supprimés
- [x] Vite chargé uniquement en développement
- [ ] Reste : sessions en mémoire et /tmp = non persistants sur Vercel → Supabase (phase 2)
- [ ] Reste : jetons OAuth à chiffrer en base, limitation de débit, validation des entrées

## Phase 1 — Interface (front) 🟡
- [ ] Récupérer ou reconstruire src/ (main, App, composants)
- [ ] 6 domaines : ajout de FINANCE (score global sur 6)
- [ ] Largeur max mobile-first, suppression de « System Architecture », radar social recentré
- [ ] États vides utiles (onboarding) à la place des fausses données « Sarah »
- [ ] Nom unique : « Sixième Sens »

## Phase 2 — Données & backend 🟡
- [ ] Supabase : tables profils, scores, alertes, appareils (RLS activée)
- [ ] Auth : Google + compte local
- [ ] API Express : /api/health, /api/user, /api/data
- [ ] Sécurité : un seul système de PIN (React), chiffrement local réel, retirer l'affichage « AES-256 ACTIF » tant que ce n'est pas vrai

## Phase 3 — Anticipation 🔴
- [ ] Météo (Open-Meteo, gratuit, sans clé)
- [ ] Google Maps / trafic : trajets du jour, alerte de départ
- [ ] Google Fit + Agenda : fatigue, surcharge, rappels
- [ ] Gemini côté serveur : prédictions et analyseur de liens
- [ ] Finance : Plaid (budget, échéances)

## Phase 4 — Viralité & lancement 🔴
- [ ] Carte « Score de vie » partageable (image)
- [ ] Parrainage, notifications push
- [ ] RGPD : export, suppression, charte réelle
- [ ] Tests, déploiement Vercel, phase bêta

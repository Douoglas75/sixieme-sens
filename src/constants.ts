import { Permission, Device, AppConnection } from './types';

export const PERMS_DATA: Permission[] = [
  { id: 'notif', icon: '🔔', bg: 'rgba(124,58,237,.15)', name: 'Notifications', desc: 'Alertes prédictives en temps réel', api: 'Notification' },
  { id: 'contacts', icon: '👥', bg: 'rgba(59,130,246,.15)', name: 'Contacts', desc: 'Radar Social avec vos proches', api: null },
  { id: 'calendar', icon: '📅', bg: 'rgba(16,185,129,.15)', name: 'Calendrier', desc: 'Optimiser planning, détecter conflits', api: null },
  { id: 'location', icon: '📍', bg: 'rgba(245,158,11,.15)', name: 'Localisation', desc: 'Alertes météo, qualité air, trajets', api: 'geolocation' },
  { id: 'health', icon: '❤️', bg: 'rgba(239,68,68,.15)', name: 'Données Santé', desc: 'Apple Health / Google Fit', api: null },
  { id: 'camera', icon: '📷', bg: 'rgba(6,182,212,.15)', name: 'Appareil Photo', desc: 'Scanner documents Ghost-Admin', api: null },
  { id: 'micro', icon: '🎙️', bg: 'rgba(236,72,153,.15)', name: 'Microphone', desc: 'Analyse vocale stress + assistant', api: null },
  { id: 'messages', icon: '💬', bg: 'rgba(124,58,237,.15)', name: 'Messages', desc: 'Radar Social — fréquence contacts', api: null },
  { id: 'calls', icon: '📞', bg: 'rgba(16,185,129,.15)', name: 'Journal appels', desc: 'Radar Social — communications', api: null },
  { id: 'bank', icon: '🏦', bg: 'rgba(245,158,11,.15)', name: 'Comptes bancaires', desc: 'Open Banking — prédictions finance', api: null }
];

export const DEVICES_DATA: Device[] = [];

export const APPS_DATA: AppConnection[] = [
  { id: 'google-fit', icon: '❤️', bg: 'rgba(239,68,68,.15)', name: 'Google Fit / Apple Health', desc: 'Santé, pas, sommeil', difficulty: 'easy', stability: 'high' },
  { id: 'google-calendar', icon: '📅', bg: 'rgba(59,130,246,.15)', name: 'Google Agenda / Calendar', desc: 'Rendez-vous, planning', difficulty: 'easy', stability: 'high' },
  { id: 'google-gmail', icon: '📧', bg: 'rgba(239,68,68,.15)', name: 'Gmail / Outlook', desc: 'Factures, rendez-vous', difficulty: 'moderate', stability: 'medium' },
  { id: 'weather', icon: '🌤️', bg: 'rgba(6,182,212,.15)', name: 'OpenWeatherMap', desc: 'Intuition environnementale (Air, Météo)', difficulty: 'easy', stability: 'high' },
  { id: 'plaid', icon: '🏦', bg: 'rgba(245,158,11,.15)', name: 'Plaid (Banque)', desc: 'Intuition financière (Comptes réels)', difficulty: 'hard', stability: 'high' }
];

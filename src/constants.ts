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

export const DEVICES_DATA: Device[] = [
  { id: 'awatch', icon: '⌚', name: 'Apple Watch', type: 'Montre connectée', signal: 'Fort' },
  { id: 'gring', icon: '💍', name: 'Samsung Galaxy Ring', type: 'Bague connectée', signal: 'Moyen' },
  { id: 'scale', icon: '⚖️', name: 'Withings Body+', type: 'Balance connectée', signal: 'Fort' },
  { id: 'bp', icon: '🩸', name: 'Omron Evolv', type: 'Tensiomètre', signal: 'Faible' },
  { id: 'band', icon: '📿', name: 'Xiaomi Band 8', type: 'Bracelet connecté', signal: 'Fort' }
];

export const APPS_DATA: AppConnection[] = [
  { id: 'gfit', icon: '❤️', bg: 'rgba(239,68,68,.15)', name: 'Google Fit / Apple Health', desc: 'Santé, pas, sommeil' },
  { id: 'gcal', icon: '📅', bg: 'rgba(59,130,246,.15)', name: 'Google Agenda / Calendar', desc: 'Rendez-vous, planning' },
  { id: 'gmail', icon: '📧', bg: 'rgba(239,68,68,.15)', name: 'Gmail / Outlook', desc: 'Factures, rendez-vous' },
  { id: 'bank', icon: '🏦', bg: 'rgba(245,158,11,.15)', name: 'Banque (Open Banking)', desc: 'Solde, dépenses' },
  { id: 'whatsapp', icon: '💬', bg: 'rgba(16,185,129,.15)', name: 'WhatsApp / Telegram', desc: 'Fréquence contacts' },
  { id: 'spotify', icon: '🎵', bg: 'rgba(16,185,129,.15)', name: 'Spotify / Apple Music', desc: 'Analyse humeur' },
  { id: 'maps', icon: '🗺️', bg: 'rgba(59,130,246,.15)', name: 'Google Maps / Waze', desc: 'Trajets' },
  { id: 'strava', icon: '🏃', bg: 'rgba(249,115,22,.15)', name: 'Strava / Nike Run', desc: 'Activité sportive' }
];

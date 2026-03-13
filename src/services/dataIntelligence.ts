import { User, ScoreData } from '../types';

export interface RealTimeData {
  source: string;
  type: 'heart_rate' | 'steps' | 'sleep' | 'finance' | 'social' | 'location';
  value: any;
  timestamp: number;
}

class DataIntelligenceService {
  private listeners: ((data: RealTimeData) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;
  private history: RealTimeData[] = [];

  constructor() {
    const saved = localStorage.getItem('6s_data_history');
    if (saved) {
      try {
        this.history = JSON.parse(saved);
      } catch (e) {
        this.history = [];
      }
    }
  }

  private saveHistory() {
    localStorage.setItem('6s_data_history', JSON.stringify(this.history.slice(0, 500)));
  }

  subscribe(callback: (data: RealTimeData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private emit(data: RealTimeData) {
    this.history.unshift(data);
    this.saveHistory();
    this.listeners.forEach(l => l(data));
  }

  getHistory() {
    return this.history;
  }

  async startDataStream(connectedDevices: string[], connectedApps: string[]) {
    if (this.interval) clearInterval(this.interval);

    if (connectedDevices.length === 0 && connectedApps.length === 0) return;

    this.interval = setInterval(async () => {
      // 1. Devices (Bluetooth)
      if (connectedDevices.length > 0) {
        this.emit({
          source: 'Appareil Connecté',
          type: 'heart_rate',
          value: 65 + Math.floor(Math.random() * 15), // Still simulated if we don't have real GATT reading yet
          timestamp: Date.now()
        });
      }

      // 2. Google Data (Calendar / Gmail / Fit)
      if (connectedApps.some(a => ['google-fit', 'calendar', 'gmail'].includes(a))) {
        try {
          const res = await fetch('/api/data/google/calendar');
          if (res.ok) {
            const events = await res.json();
            if (events && events.length > 0) {
              this.emit({
                source: 'Google Calendar',
                type: 'social',
                value: events,
                timestamp: Date.now()
              });
            }
          }
        } catch (e) {
          console.error('Failed to fetch calendar data');
        }
      }

      // 3. Spotify Data
      if (connectedApps.includes('spotify')) {
        try {
          const res = await fetch('/api/data/spotify/recent');
          if (res.ok) {
            const tracks = await res.json();
            if (tracks && tracks.length > 0) {
              this.emit({
                source: 'Spotify',
                type: 'social',
                value: tracks,
                timestamp: Date.now()
              });
            }
          }
        } catch (e) {
          console.error('Failed to fetch spotify data');
        }
      }

      // 4. Finance (Stays simulated for now as Open Banking requires real API keys)
      if (connectedApps.includes('bank')) {
        if (Math.random() > 0.98) {
          this.emit({
            source: 'Banque',
            type: 'finance',
            value: { amount: -(Math.random() * 40 + 5).toFixed(2), category: 'Shopping' },
            timestamp: Date.now()
          });
        }
      }
    }, 10000); // Fetch every 10s to avoid rate limits
  }

  stopDataStream() {
    if (this.interval) clearInterval(this.interval);
  }

  analyzeData(history: RealTimeData[]): ScoreData {
    const heartRates = history.filter(d => d.type === 'heart_rate').map(d => d.value);
    const avgHR = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : null;

    const calendarEvents = history.filter(d => d.source === 'Google Calendar').map(d => d.value).flat();
    const spotifyTracks = history.filter(d => d.source === 'Spotify').map(d => d.value).flat();
    
    // Logic for Cognitive Load (C)
    // More events = higher load = lower score
    let cognitiveScore = 7.5;
    if (calendarEvents.length > 5) cognitiveScore -= 1.0;
    if (calendarEvents.length > 10) cognitiveScore -= 1.0;

    // Logic for Mood (H)
    // This is a placeholder for real sentiment analysis of tracks
    let moodScore = 8.0;
    if (avgHR && avgHR > 90) moodScore -= 0.5; // Stress indicator
    if (spotifyTracks.length > 0) moodScore += 0.2; // Music usually helps

    return {
      h: moodScore.toFixed(1),
      f: (7.5).toFixed(1),
      s: (8.0).toFixed(1),
      c: cognitiveScore.toFixed(1),
      k: (7.0).toFixed(1),
      a: (8.0).toFixed(1),
      t: '0.0'
    };
  }
}

export const dataIntelligence = new DataIntelligenceService();

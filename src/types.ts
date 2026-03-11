export interface User {
  name: string;
  sleep: number;
  activity: 'low' | 'medium' | 'high' | 'athlete';
  finance: 'tight' | 'ok' | 'comfortable';
  contacts: Contact[];
}

export interface Contact {
  name: string;
  relation: string;
  lastContact: number;
  health?: 'healthy' | 'warning' | 'danger';
}

export interface ScoreData {
  h: string; // Health
  f: string; // Finance
  s: string; // Social
  c: string; // Cognitive
  k: string; // Career
  a: string; // Admin
  t: string; // Total
}

export interface Prediction {
  id: string;
  type: 'health' | 'finance' | 'social' | 'cognitive';
  cat: string;
  title: string;
  desc: string;
  conf: number;
  tl: string;
  rec: string;
  cd: number[];
}

export interface Alert {
  type: 'red' | 'yellow' | 'green';
  icon: string;
  title: string;
  desc: string;
  time: string;
  actions: string[];
}

export interface GhostTask {
  id: string;
  icon: string;
  bg: string;
  title: string;
  desc: string;
  st: 'completed' | 'progress' | 'available';
  stl: string;
  sav?: string;
  progress?: number;
}

export interface Device {
  id: string;
  icon: string;
  name: string;
  type: string;
  signal: string;
  connected?: boolean;
  connecting?: boolean;
}

export interface AppConnection {
  id: string;
  icon: string;
  bg: string;
  name: string;
  desc: string;
  linked?: boolean;
  linking?: boolean;
}

export interface Permission {
  id: string;
  icon: string;
  bg: string;
  name: string;
  desc: string;
  api: string | null;
  granted?: boolean;
}

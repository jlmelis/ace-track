
export type StatCategory = 'Attacking' | 'Serving' | 'Defense' | 'Setting' | 'Blocking';

export interface StatDefinition {
  id: string;
  label: string;
  category: StatCategory;
  enabled: boolean;
}

export interface PlayerProfile {
  name: string;
  number: string;
  position: string;
  trackedStats: string[]; // IDs of definitions
  categoryAliases: Record<StatCategory, string>; // 1-2 char labels for tabs
}

export interface StatLog {
  id: string;
  statId: string;
  timestamp: number;
  value: number; // usually 1 for increment, but could be specific values
}

export interface SetData {
  id: string;
  setNumber: number;
  logs: StatLog[];
  isCompleted: boolean;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  sets: SetData[];
}

export interface Event {
  id: string;
  name: string;
  location: string;
  matches: Match[];
}

export interface AppState {
  events: Event[];
  profile: PlayerProfile;
}

export const DEFAULT_STATS: StatDefinition[] = [
  // Attacking
  { id: 'kill', label: 'Kill', category: 'Attacking', enabled: true },
  { id: 'attack_err', label: 'Atk Error', category: 'Attacking', enabled: true },
  { id: 'attack_attempt', label: 'Atk In Play', category: 'Attacking', enabled: true },
  { id: 'attack_roll', label: 'Roll Shot', category: 'Attacking', enabled: true },
  { id: 'attack_tip', label: 'Tip', category: 'Attacking', enabled: true },
  
  // Serving
  { id: 'ace', label: 'Ace', category: 'Serving', enabled: true },
  { id: 'serve_err', label: 'Srv Error', category: 'Serving', enabled: true },
  { id: 'serve_in', label: 'Srv In Play', category: 'Serving', enabled: true },
  
  // Defense
  { id: 'dig', label: 'Dig', category: 'Defense', enabled: true },
  { id: 'dig_err', label: 'Dig Error', category: 'Defense', enabled: true },
  { id: 'reception_err', label: 'Rec Error', category: 'Defense', enabled: true },
  { id: 'reception_good', label: 'Rec Good', category: 'Defense', enabled: true },
  
  // Setting
  { id: 'assist', label: 'Assist', category: 'Setting', enabled: true },
  { id: 'set_attempt', label: 'Set Attempt', category: 'Setting', enabled: true },
  { id: 'bhe', label: 'BHE (Double)', category: 'Setting', enabled: true },
  
  // Blocking
  { id: 'block_solo', label: 'Solo Block', category: 'Blocking', enabled: true },
  { id: 'block_assist', label: 'Blk Assist', category: 'Blocking', enabled: true },
  { id: 'block_touch', label: 'Blk Touch', category: 'Blocking', enabled: true },
  { id: 'block_err', label: 'Blk Error', category: 'Blocking', enabled: true },
];

export const DEFAULT_ALIASES: Record<StatCategory, string> = {
  'Attacking': 'AT',
  'Serving': 'SV',
  'Defense': 'DF',
  'Setting': 'ST',
  'Blocking': 'BK'
};

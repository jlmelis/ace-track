import { AppState } from './types';

const DB_NAME = 'AceTrackDB';
const STORE_NAME = 'app_state';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveAppState = async (state: AppState): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, 'current');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAppState = async (): Promise<AppState | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const exportData = async (): Promise<string> => {
  const state = await getAppState();
  if (!state) {
    throw new Error('No data to export');
  }
  return JSON.stringify(state);
};

export const restoreBackup = async (jsonData: string): Promise<void> => {
  try {
    const state = JSON.parse(jsonData) as AppState;
    // Basic validation to ensure it looks like an AppState
    if (!state || typeof state !== 'object' || !Array.isArray(state.events) || !state.profile) {
      throw new Error('Invalid backup file format.');
    }
    await saveAppState(state);
  } catch (error) {
    throw new Error(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// --- CSV Import Features ---

// Helper to deduce a statId from a label if it matches default stats
import { DEFAULT_STATS } from './types';

const getStatIdFromLabel = (label: string): string => {
  const stat = DEFAULT_STATS.find(s => s.label === label);
  return stat ? stat.id : label.toLowerCase().replace(/[^a-z0-9]/g, '_');
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const parseEventsCsv = (csvText: string, filename: string): import('./types').Event[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error("CSV file is empty or invalid.");

  const headers = parseCsvLine(lines[0]).map(h => h.trim());

  const isTournament = headers[0] === 'Match' && headers[1] === 'Date';
  const isSingleMatch = headers[0] === 'Set' && headers[1] === 'Category';

  if (!isTournament && !isSingleMatch) {
    throw new Error("Unsupported CSV format. Headers do not match expected export format.");
  }

  // Derive an event name from the filename
  let eventName = 'Imported Event';
  const nameMatch = filename.match(/AceTrack_(.*?)_(?:Full_Report|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (nameMatch && nameMatch[1]) {
    eventName = nameMatch[1].replace(/_/g, ' ');
  } else {
    eventName = filename.replace('.csv', '');
  }

  const generatedEventId = crypto.randomUUID();
  const generatedEvent: import('./types').Event = {
    id: generatedEventId,
    name: eventName,
    location: 'Imported',
    date: new Date().toISOString().split('T')[0],
    matches: []
  };

  const matchMap = new Map<string, import('./types').Match>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Stop parsing if we hit the Tournament Totals section
    if (line.includes('TOURNAMENT TOTALS')) break;

    const cols = parseCsvLine(line).map(c => c.trim().replace(/^"|"$/g, ''));

    if (isTournament && cols.length >= 6) {
      const opp = cols[0];
      const matchDate = cols[1];
      const setStr = cols[2];
      const label = cols[4];
      const timestamp = new Date(cols[5]).getTime() || Date.now();

      if (!opp || !setStr) continue;

      let match = matchMap.get(opp);
      if (!match) {
        match = { id: crypto.randomUUID(), opponent: opp, date: matchDate || generatedEvent.date, sets: [] };
        matchMap.set(opp, match);
      }

      const setNumMatch = setStr.match(/\d+/);
      const setNum = setNumMatch ? parseInt(setNumMatch[0]) : 1;

      let setObj = match.sets.find(s => s.setNumber === setNum);
      if (!setObj) {
        setObj = { id: crypto.randomUUID(), setNumber: setNum, logs: [], isCompleted: true };
        match.sets.push(setObj);
      }

      setObj.logs.push({
        id: crypto.randomUUID(),
        statId: getStatIdFromLabel(label),
        timestamp,
        value: 1
      });

    } else if (isSingleMatch && cols.length >= 5) {
      const setStr = cols[0];
      const label = cols[2];
      const valStr = cols[3];
      const timeStr = cols[4];

      if (!setStr) continue;

      const oppName = eventName.replace(/^vs\s+/i, ''); // often saved as vs_Opponent

      let match = matchMap.get(oppName);
      if (!match) {
        match = { id: crypto.randomUUID(), opponent: oppName, date: generatedEvent.date, sets: [] };
        matchMap.set(oppName, match);
      }

      const setNumMatch = setStr.match(/\d+/);
      const setNum = setNumMatch ? parseInt(setNumMatch[0]) : 1;

      let setObj = match.sets.find(s => s.setNumber === setNum);
      if (!setObj) {
        setObj = { id: crypto.randomUUID(), setNumber: setNum, logs: [], isCompleted: true };
        match.sets.push(setObj);
      }

      // Try to construct a good timestamp. Default to now if parsing fails.
      let timestamp = Date.now();
      const tempDate = new Date(`${generatedEvent.date} ${timeStr}`);
      if (!isNaN(tempDate.getTime())) timestamp = tempDate.getTime();

      setObj.logs.push({
        id: crypto.randomUUID(),
        statId: getStatIdFromLabel(label),
        timestamp,
        value: parseInt(valStr) || 1
      });
    }
  }

  generatedEvent.matches = Array.from(matchMap.values());

  // Set the event date to the earliest match date, if any
  if (generatedEvent.matches.length > 0) {
    const dates = generatedEvent.matches.map(m => m.date).filter(Boolean);
    if (dates.length > 0) {
      dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      generatedEvent.date = dates[0].split('T')[0];
    }
  }

  return [generatedEvent];
};

export const importEventsFromCsv = async (events: import('./types').Event[]): Promise<number> => {
  const state = await getAppState();
  if (!state) {
    throw new Error('No valid state available to merge into. Please initialize first or ensure data exists.');
  }

  let importedCount = 0;
  for (const newEvent of events) {
    const existingIndex = state.events.findIndex(e => e.id === newEvent.id || e.name === newEvent.name);
    if (existingIndex >= 0) {
      // If we matched strictly by ID, replace it. If by name, let's keep ID for upsert safety
      newEvent.id = state.events[existingIndex].id;
      state.events[existingIndex] = newEvent;
    } else {
      state.events.push(newEvent);
    }
    importedCount++;
  }

  await saveAppState(state);
  return importedCount;
};


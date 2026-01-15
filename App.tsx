import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Event, Match, SetData, PlayerProfile, DEFAULT_STATS, DEFAULT_ALIASES, StatLog, StatDefinition } from './types.ts';
import { RefreshCw, X, Loader2 } from 'lucide-react';
import { saveAppState, getAppState } from './db.ts';

// Components
import Layout from './components/Layout.tsx';
import Dashboard from './views/Dashboard.tsx';
import EventDetail from './views/EventDetail.tsx';
import MatchDetail from './views/MatchDetail.tsx';
import SetTracker from './views/SetTracker.tsx';
import ProfileSettings from './views/ProfileSettings.tsx';
import OnboardingModal from './components/OnboardingModal.tsx';

const STORAGE_KEY_OLD = 'acetrack_v1_data';
const ONBOARDING_KEY = 'acetrack_onboarding_seen';
const VERSION = 'v19';

const App: React.FC = () => {
  // Navigation & UI State
  const [currentView, setCurrentView] = useState<'dashboard' | 'event' | 'match' | 'set' | 'settings'>('dashboard');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // PWA Update State
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // App Data State
  const [data, setData] = useState<AppState>({
    events: [],
    customStats: [],
    profile: {
      name: 'My Daughter',
      number: '10',
      position: 'Outside Hitter',
      trackedStats: DEFAULT_STATS.map(s => s.id),
      categoryAliases: { ...DEFAULT_ALIASES }
    }
  });

  // Initial Load & Migration
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbData = await getAppState();
        const localDataRaw = localStorage.getItem(STORAGE_KEY_OLD);
        
        if (dbData) {
          setData(dbData);
          // If we have both, migration already happened, but let's clear local just in case
          if (localDataRaw) localStorage.removeItem(STORAGE_KEY_OLD);
        } else if (localDataRaw) {
          // Migration path
          const parsed = JSON.parse(localDataRaw);
          setData(parsed);
          await saveAppState(parsed);
          localStorage.removeItem(STORAGE_KEY_OLD);
        }
      } catch (err) {
        console.error("Failed to load database", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Persistence Sync (Debounced for performance)
  useEffect(() => {
    if (isLoading) return;
    const timeout = setTimeout(() => {
      saveAppState(data).catch(err => console.error("Database write error", err));
    }, 500);
    return () => clearTimeout(timeout);
  }, [data, isLoading]);

  const allStats = useMemo(() => [...DEFAULT_STATS, ...data.customStats], [data.customStats]);

  // Handle PWA Updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.update();
        const checkWorker = (worker: ServiceWorker | null) => {
          if (worker && worker.state === 'installed') {
            setWaitingWorker(worker);
            setShowUpdatePrompt(true);
          }
        };
        checkWorker(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) setShowOnboarding(true);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const activeEvent = useMemo(() => data.events.find(e => e.id === activeEventId), [data.events, activeEventId]);
  const activeMatch = useMemo(() => activeEvent?.matches.find(m => m.id === activeMatchId), [activeEvent, activeMatchId]);
  const activeSet = useMemo(() => activeMatch?.sets.find(s => s.id === activeSetId), [activeMatch, activeSetId]);

  const addEvent = (name: string, location: string, date: string, endDate?: string) => {
    const newEvent: Event = { id: crypto.randomUUID(), name, location, date, endDate, matches: [] };
    setData(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
  };

  const deleteEvent = (id: string) => {
    if (window.confirm('Delete this tournament and all its matches?')) {
      setData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
      if (activeEventId === id) {
        setActiveEventId(null);
        setActiveMatchId(null);
        setActiveSetId(null);
        setCurrentView('dashboard');
      }
    }
  };

  const addMatch = (eventId: string, opponent: string, matchDate: string) => {
    const newMatch: Match = { id: crypto.randomUUID(), opponent, date: matchDate, sets: [] };
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? { ...e, matches: [...e.matches, newMatch] } : e)
    }));
  };

  const deleteMatch = (eventId: string, matchId: string) => {
    if (window.confirm('Delete this match and all its sets?')) {
      setData(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? {
          ...e,
          matches: e.matches.filter(m => m.id !== matchId)
        } : e)
      }));
      if (activeMatchId === matchId) {
        setActiveMatchId(null);
        setActiveSetId(null);
        setCurrentView('event');
      }
    }
  };

  const addSet = (eventId: string, matchId: string) => {
    const match = data.events.find(e => e.id === eventId)?.matches.find(m => m.id === matchId);
    const newSet: SetData = { id: crypto.randomUUID(), setNumber: (match?.sets.length || 0) + 1, logs: [], isCompleted: false };
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? {
        ...e,
        matches: e.matches.map(m => m.id === matchId ? { ...m, sets: [...m.sets, newSet] } : m)
      } : e)
    }));
    setActiveSetId(newSet.id);
    setCurrentView('set');
  };

  const deleteSet = (eventId: string, matchId: string, setId: string) => {
    if (window.confirm('Delete this set?')) {
      setData(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? {
          ...e,
          matches: e.matches.map(m => m.id === matchId ? {
            ...m,
            sets: m.sets.filter(s => s.id !== setId)
          } : m)
        } : e)
      }));
      if (activeSetId === setId) {
        setActiveSetId(null);
        setCurrentView('match');
      }
    }
  };

  const addCustomStat = (stat: Omit<StatDefinition, 'id' | 'enabled'>) => {
    const newStat: StatDefinition = {
      ...stat,
      id: crypto.randomUUID(),
      enabled: true,
      isCustom: true
    };
    setData(prev => ({
      ...prev,
      customStats: [...prev.customStats, newStat],
      profile: {
        ...prev.profile,
        trackedStats: [...prev.profile.trackedStats, newStat.id]
      }
    }));
  };

  const deleteCustomStat = (id: string) => {
    if (window.confirm('Delete this custom stat? This will remove it from all tracking and profile views.')) {
      setData(prev => ({
        ...prev,
        customStats: prev.customStats.filter(s => s.id !== id),
        profile: {
          ...prev.profile,
          trackedStats: prev.profile.trackedStats.filter(sid => sid !== id)
        }
      }));
    }
  };

  const recordStat = (statId: string) => {
    if (!activeEventId || !activeMatchId || !activeSetId) return;
    const log: StatLog = { id: crypto.randomUUID(), statId, timestamp: Date.now(), value: 1 };
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === activeEventId ? {
        ...e,
        matches: e.matches.map(m => m.id === activeMatchId ? {
          ...m,
          sets: m.sets.map(s => s.id === activeSetId ? { ...s, logs: [...s.logs, log] } : s)
        } : m)
      } : e)
    }));
  };

  const undoLastStat = () => {
    if (!activeEventId || !activeMatchId || !activeSetId) return;
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === activeEventId ? {
        ...e,
        matches: e.matches.map(m => m.id === activeMatchId ? {
          ...m,
          sets: m.sets.map(s => s.id === activeSetId ? { ...s, logs: s.logs.slice(0, -1) } : s)
        } : m)
      } : e)
    }));
  };

  const toggleSetComplete = () => {
    if (!activeEventId || !activeMatchId || !activeSetId) return;
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === activeEventId ? {
        ...e,
        matches: e.matches.map(m => m.id === activeMatchId ? {
          ...m,
          sets: m.sets.map(s => s.id === activeSetId ? { ...s, isCompleted: !s.isCompleted } : s)
        } : m)
      } : e)
    }));
  };

  const updateProfile = (profile: PlayerProfile) => setData(prev => ({ ...prev, profile }));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-sm font-bold uppercase tracking-widest">Opening Database...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard events={data.events} onAddEvent={addEvent} onSelectEvent={(id) => { setActiveEventId(id); setCurrentView('event'); }} onDeleteEvent={deleteEvent} />;
      case 'event':
        return activeEvent ? <EventDetail event={activeEvent} onBack={() => setCurrentView('dashboard')} onAddMatch={(opp, mdate) => addMatch(activeEvent.id, opp, mdate)} onSelectMatch={(id) => { setActiveMatchId(id); setCurrentView('match'); }} onDeleteMatch={(mid) => deleteMatch(activeEvent.id, mid)} allStats={allStats} /> : null;
      case 'match':
        return activeMatch && activeEvent ? <MatchDetail match={activeMatch} profile={data.profile} onBack={() => setCurrentView('event')} onAddSet={() => addSet(activeEvent.id, activeMatch.id)} onSelectSet={(id) => { setActiveSetId(id); setCurrentView('set'); }} onDeleteSet={(sid) => deleteSet(activeEvent.id, activeMatch.id, sid)} allStats={allStats} /> : null;
      case 'set':
        return activeSet && activeMatch && activeEvent ? <SetTracker set={activeSet} match={activeMatch} profile={data.profile} onBack={() => setCurrentView('match')} onRecord={recordStat} onUndo={undoLastStat} onToggleComplete={toggleSetComplete} allStats={allStats} /> : null;
      case 'settings':
        return <ProfileSettings profile={data.profile} onSave={updateProfile} onBack={() => setCurrentView('dashboard')} customStats={data.customStats} onAddCustomStat={addCustomStat} onDeleteCustomStat={deleteCustomStat} />;
      default:
        return null;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} playerName={data.profile.name} hasActiveSet={!!activeSetId}>
      {renderContent()}
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
      {showUpdatePrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl text-white animate-pulse"><RefreshCw size={20} /></div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none">Update Available</h4>
                <p className="text-[10px] text-indigo-100 mt-1 uppercase tracking-wider font-medium">AceTrack {VERSION}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={handleUpdate} className="bg-white text-indigo-600 text-xs font-black px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all uppercase tracking-widest">Update Now</button>
               <button onClick={() => setShowUpdatePrompt(false)} className="p-1 text-indigo-200 hover:text-white transition-colors"><X size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
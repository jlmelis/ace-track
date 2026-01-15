
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Event, Match, SetData, PlayerProfile, DEFAULT_STATS, DEFAULT_ALIASES, StatLog } from './types.ts';
import { RefreshCw, X } from 'lucide-react';

// Components
import Layout from './components/Layout.tsx';
import Dashboard from './views/Dashboard.tsx';
import EventDetail from './views/EventDetail.tsx';
import MatchDetail from './views/MatchDetail.tsx';
import SetTracker from './views/SetTracker.tsx';
import ProfileSettings from './views/ProfileSettings.tsx';
import OnboardingModal from './components/OnboardingModal.tsx';

const STORAGE_KEY = 'acetrack_v1_data';
const ONBOARDING_KEY = 'acetrack_onboarding_seen';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'event' | 'match' | 'set' | 'settings'>('dashboard');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // PWA Update State
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // App Data State
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.profile.categoryAliases) {
        parsed.profile.categoryAliases = { ...DEFAULT_ALIASES };
      }
      return parsed;
    }
    return {
      events: [],
      profile: {
        name: 'My Daughter',
        number: '10',
        position: 'Outside Hitter',
        trackedStats: DEFAULT_STATS.map(s => s.id),
        categoryAliases: { ...DEFAULT_ALIASES }
      }
    };
  });

  // Handle PWA Updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // Force an immediate check on app load
        reg.update();

        const checkWorker = (worker: ServiceWorker | null) => {
          if (worker && worker.state === 'installed') {
            setWaitingWorker(worker);
            setShowUpdatePrompt(true);
          }
        };

        // Check current states
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

        const checkUpdate = () => {
          reg.update().catch(err => console.debug('SW update check failed', err));
        };
        window.addEventListener('focus', checkUpdate);
        return () => window.removeEventListener('focus', checkUpdate);
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeEvent = useMemo(() => data.events.find(e => e.id === activeEventId), [data.events, activeEventId]);
  const activeMatch = useMemo(() => activeEvent?.matches.find(m => m.id === activeMatchId), [activeEvent, activeMatchId]);
  const activeSet = useMemo(() => activeMatch?.sets.find(s => s.id === activeSetId), [activeMatch, activeSetId]);

  const addEvent = (name: string, location: string, date: string) => {
    const newEvent: Event = { id: crypto.randomUUID(), name, location, date, matches: [] };
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

  const addMatch = (eventId: string, opponent: string) => {
    const newMatch: Match = { id: crypto.randomUUID(), opponent, date: new Date().toLocaleDateString(), sets: [] };
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? { ...e, matches: [...e.matches, newMatch] } : e)
    }));
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
    switch (currentView) {
      case 'dashboard':
        return <Dashboard events={data.events} onAddEvent={addEvent} onSelectEvent={(id) => { setActiveEventId(id); setCurrentView('event'); }} onDeleteEvent={deleteEvent} />;
      case 'event':
        return activeEvent ? <EventDetail event={activeEvent} onBack={() => setCurrentView('dashboard')} onAddMatch={(opp) => addMatch(activeEvent.id, opp)} onSelectMatch={(id) => { setActiveMatchId(id); setCurrentView('match'); }} /> : null;
      case 'match':
        return activeMatch && activeEvent ? <MatchDetail match={activeMatch} profile={data.profile} onBack={() => setCurrentView('event')} onAddSet={() => addSet(activeEvent.id, activeMatch.id)} onSelectSet={(id) => { setActiveSetId(id); setCurrentView('set'); }} /> : null;
      case 'set':
        return activeSet && activeMatch && activeEvent ? <SetTracker set={activeSet} match={activeMatch} profile={data.profile} onBack={() => setCurrentView('match')} onRecord={recordStat} onUndo={undoLastStat} onToggleComplete={toggleSetComplete} /> : null;
      case 'settings':
        return <ProfileSettings profile={data.profile} onSave={updateProfile} onBack={() => setCurrentView('dashboard')} />;
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
                <p className="text-[10px] text-indigo-100 mt-1 uppercase tracking-wider font-medium">AceTrack {CACHE_NAME}</p>
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

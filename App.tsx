
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Event, Match, SetData, PlayerProfile, DEFAULT_STATS, StatLog } from './types.ts';

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

  // App Data State
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      events: [],
      profile: {
        name: 'My Daughter',
        number: '10',
        position: 'Outside Hitter',
        trackedStats: DEFAULT_STATS.map(s => s.id)
      }
    };
  });

  // Check for first visit
  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // Persist data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Derived Values
  const activeEvent = useMemo(() => data.events.find(e => e.id === activeEventId), [data.events, activeEventId]);
  const activeMatch = useMemo(() => activeEvent?.matches.find(m => m.id === activeMatchId), [activeEvent, activeMatchId]);
  const activeSet = useMemo(() => activeMatch?.sets.find(s => s.id === activeSetId), [activeMatch, activeSetId]);

  // Actions
  const addEvent = (name: string, location: string) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      name,
      location,
      matches: []
    };
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
    const newMatch: Match = {
      id: crypto.randomUUID(),
      opponent,
      date: new Date().toLocaleDateString(),
      sets: []
    };
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? { ...e, matches: [...e.matches, newMatch] } : e)
    }));
  };

  const addSet = (eventId: string, matchId: string) => {
    const match = data.events.find(e => e.id === eventId)?.matches.find(m => m.id === matchId);
    const newSet: SetData = {
      id: crypto.randomUUID(),
      setNumber: (match?.sets.length || 0) + 1,
      logs: [],
      isCompleted: false
    };
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
    const log: StatLog = {
      id: crypto.randomUUID(),
      statId,
      timestamp: Date.now(),
      value: 1
    };
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

  const updateProfile = (profile: PlayerProfile) => {
    setData(prev => ({ ...prev, profile }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          events={data.events} 
          onAddEvent={addEvent} 
          onSelectEvent={(id) => { setActiveEventId(id); setCurrentView('event'); }}
          onDeleteEvent={deleteEvent}
        />;
      case 'event':
        return activeEvent ? (
          <EventDetail 
            event={activeEvent}
            onBack={() => setCurrentView('dashboard')}
            onAddMatch={(opp) => addMatch(activeEvent.id, opp)}
            onSelectMatch={(id) => { setActiveMatchId(id); setCurrentView('match'); }}
          />
        ) : null;
      case 'match':
        return activeMatch && activeEvent ? (
          <MatchDetail 
            match={activeMatch}
            onBack={() => setCurrentView('event')}
            onAddSet={() => addSet(activeEvent.id, activeMatch.id)}
            onSelectSet={(id) => { setActiveSetId(id); setCurrentView('set'); }}
          />
        ) : null;
      case 'set':
        return activeSet && activeMatch && activeEvent ? (
          <SetTracker 
            set={activeSet}
            match={activeMatch}
            profile={data.profile}
            onBack={() => setCurrentView('match')}
            onRecord={recordStat}
            onUndo={undoLastStat}
            onToggleComplete={toggleSetComplete}
          />
        ) : null;
      case 'settings':
        return <ProfileSettings 
          profile={data.profile} 
          onSave={updateProfile} 
          onBack={() => setCurrentView('dashboard')}
        />;
      default:
        return null;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      playerName={data.profile.name}
      hasActiveSet={!!activeSetId}
    >
      {renderContent()}
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </Layout>
  );
};

export default App;

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { SetData, Match, PlayerProfile, StatDefinition, StatCategory, CATEGORY_ORDER } from '../types.ts';

interface SetTrackerProps {
  set: SetData;
  match: Match;
  profile: PlayerProfile;
  onBack: () => void;
  onRecord: (statId: string) => void;
  onUndo: () => void;
  onToggleComplete: () => void;
  allStats: StatDefinition[];
}

const CATEGORY_THEMES: Record<StatCategory, { bg: string; text: string; border: string; btn: string }> = {
  'Attacking': { bg: 'bg-brand-primary-900', text: 'text-brand-primary-900', border: 'border-brand-primary-100', btn: 'active:bg-brand-primary-50 active:border-brand-primary-900' },
  'Serving': { bg: 'bg-brand-accent', text: 'text-brand-accent', border: 'border-brand-accent-light', btn: 'active:bg-brand-accent-light active:border-brand-accent' },
  'Defense': { bg: 'bg-brand-success', text: 'text-brand-success', border: 'border-brand-success-light', btn: 'active:bg-brand-success-light active:border-brand-success' },
  'Setting': { bg: 'bg-brand-primary-600', text: 'text-brand-primary-700', border: 'border-brand-primary-100', btn: 'active:bg-brand-primary-50 active:border-brand-primary-600' },
  'Blocking': { bg: 'bg-brand-neutral-800', text: 'text-brand-neutral-800', border: 'border-brand-neutral-200', btn: 'active:bg-brand-neutral-50 active:border-brand-neutral-800' },
};

const SetTracker: React.FC<SetTrackerProps> = ({ 
  set, 
  match, 
  profile, 
  onBack, 
  onRecord, 
  onUndo, 
  onToggleComplete,
  allStats
}) => {
  const [toastVisible, setToastVisible] = useState(false);
  const logCount = set.logs.length;

  useEffect(() => {
    if (logCount > 0) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [logCount]);

  const enabledStats = useMemo(() => {
    return allStats.filter(stat => profile.trackedStats.includes(stat.id));
  }, [profile.trackedStats, allStats]);

  const categories = useMemo(() => {
    const activeCats = new Set<StatCategory>();
    enabledStats.forEach(s => activeCats.add(s.category));
    return CATEGORY_ORDER.filter(cat => activeCats.has(cat));
  }, [enabledStats]);

  const [activeTab, setActiveTab] = useState<StatCategory>(categories[0] || 'Attacking');

  // Handle case where active tab might disappear if a category has no enabled stats
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const groupedStats = useMemo(() => {
    const groups: Record<string, StatDefinition[]> = {};
    enabledStats.forEach(stat => {
      if (!groups[stat.category]) groups[stat.category] = [];
      groups[stat.category].push(stat);
    });
    return groups;
  }, [enabledStats]);

  const setTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    set.logs.forEach(log => {
      totals[log.statId] = (totals[log.statId] || 0) + 1;
    });
    return totals;
  }, [set.logs]);

  const lastStat = set.logs[set.logs.length - 1];
  const lastStatLabel = lastStat ? allStats.find(s => s.id === lastStat.statId)?.label : null;

return (
    <div className="flex flex-col min-h-screen bg-brand-neutral-50">
      {/* Header - Standardized AceTrack Style */}
      <div className="bg-white border-b-2 border-brand-neutral-200 sticky top-0 z-40">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -ml-1 text-brand-neutral-500 active:bg-brand-neutral-50 rounded-full transition-colors">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div>
              <h2 className="text-base font-black text-brand-neutral-800 leading-none italic uppercase">Set {set.setNumber}</h2>
              <p className="text-[10px] font-bold text-brand-neutral-400 mt-1 uppercase tracking-widest">vs {match.opponent}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {set.logs.length > 0 && (
              <button 
                onClick={onUndo}
                className="p-2 bg-brand-neutral-50 text-brand-neutral-500 rounded-xl active:bg-brand-primary-50 active:text-brand-primary-900 active:scale-90 transition-all border border-brand-neutral-200"
              >
                <RotateCcw size={20} strokeWidth={2.5} />
              </button>
            )}
            <button 
              onClick={onToggleComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm border-2 ${
                set.isCompleted 
                ? 'bg-brand-success-light text-brand-success border-brand-success/20' 
                : 'bg-brand-primary-900 text-white border-brand-primary-900'
              }`}
            >
              {set.isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <Circle size={14} strokeWidth={3} />}
              {set.isCompleted ? 'Done' : 'End'}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 flex justify-between gap-1.5">
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            const theme = CATEGORY_THEMES[cat];
            const alias = profile.categoryAliases?.[cat] || cat.slice(0, 2).toUpperCase();
            
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 border-2
                  ${isActive 
                    ? `${theme.bg} text-white border-transparent shadow-lg scale-105 z-10 font-black italic` 
                    : 'bg-white text-brand-neutral-400 font-bold border-brand-neutral-200 hover:border-brand-primary-200'
                  }
                `}
              >
                <span className="text-[11px] tracking-tighter uppercase">{alias}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {categories.length === 0 ? (
          <div className="text-center py-20 px-10">
             <p className="text-xs text-brand-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
               No stats enabled.<br/>
               <span className="text-brand-primary-400">Configure tracking in Settings.</span>
             </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] italic ${CATEGORY_THEMES[activeTab].text}`}>
                {activeTab}
              </h3>
              <span className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">
                {groupedStats[activeTab]?.length || 0} METRICS
              </span>
            </div>

            {set.isCompleted && (
              <div className="bg-brand-success-light border-2 border-brand-success/20 text-brand-success p-4 rounded-2xl text-[10px] text-center font-black uppercase tracking-[0.3em] animate-in fade-in zoom-in-95">
                Set Recorded & Complete
              </div>
            )}

            {/* Tracking Grid */}
            <div className="grid grid-cols-2 gap-3">
              {(groupedStats[activeTab] || []).map(stat => (
                <button
                  key={stat.id}
                  disabled={set.isCompleted}
                  onClick={() => onRecord(stat.id)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all active:scale-90
                    ${set.isCompleted 
                      ? 'bg-brand-neutral-50 border-brand-neutral-100 opacity-30' 
                      : `bg-white border-brand-neutral-200/60 shadow-md ${CATEGORY_THEMES[activeTab].btn}`
                    }
                  `}
                >
                  <span className={`text-4xl font-black mb-1 tabular-nums italic ${setTotals[stat.id] ? CATEGORY_THEMES[activeTab].text : 'text-brand-neutral-800'}`}>
                    {setTotals[stat.id] || 0}
                  </span>
                  <span className="text-[10px] font-black text-brand-neutral-500 uppercase tracking-tight text-center leading-none px-1">
                    {stat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Feed Section */}
            {set.logs.length > 0 && (
              <div className="pt-6 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em] px-2 mb-3">
                  Log Feed
                </h3>
                <div className="space-y-2">
                  {set.logs.slice(-2).reverse().map((log, i) => (
                    <div key={log.id} className={`flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-brand-neutral-200 ${i === 0 ? 'ring-4 ring-brand-primary-900/5 border-brand-primary-200' : 'opacity-40 shadow-inner bg-brand-neutral-50'}`}>
                      <span className="text-xs font-bold text-brand-neutral-800 uppercase italic">
                        {allStats.find(s => s.id === log.statId)?.label}
                      </span>
                      <span className="text-[10px] text-brand-neutral-400 font-black tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Standardized AceTrack Toast */}
      {toastVisible && lastStatLabel && !set.isCompleted && (
        <div 
          key={set.logs.length} 
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-neutral-800/95 backdrop-blur-md text-white px-8 py-4 rounded-full text-[11px] font-black shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none uppercase tracking-[0.25em] border border-white/10 z-[60] italic"
        >
          +1 {lastStatLabel}
        </div>
      )}
    </div>
  );
};

export default SetTracker;
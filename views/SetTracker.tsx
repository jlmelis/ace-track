import React, { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { SetData, Match, PlayerProfile, DEFAULT_STATS, StatDefinition, StatCategory } from '../types.ts';

interface SetTrackerProps {
  set: SetData;
  match: Match;
  profile: PlayerProfile;
  onBack: () => void;
  onRecord: (statId: string) => void;
  onUndo: () => void;
  onToggleComplete: () => void;
}

const CATEGORY_COLORS: Record<StatCategory, { bg: string; text: string; border: string; btn: string }> = {
  'Attacking': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', btn: 'active:bg-orange-100 active:border-orange-500' },
  'Serving': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', btn: 'active:bg-blue-100 active:border-blue-500' },
  'Defense': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', btn: 'active:bg-emerald-100 active:border-emerald-500' },
  'Setting': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', btn: 'active:bg-indigo-100 active:border-indigo-500' },
  'Blocking': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', btn: 'active:bg-slate-200 active:border-slate-500' },
};

const SetTracker: React.FC<SetTrackerProps> = ({ 
  set, 
  match, 
  profile, 
  onBack, 
  onRecord, 
  onUndo, 
  onToggleComplete 
}) => {
  const enabledStats = useMemo(() => {
    return DEFAULT_STATS.filter(stat => profile.trackedStats.includes(stat.id));
  }, [profile.trackedStats]);

  const categories = useMemo(() => {
    const cats = new Set<StatCategory>();
    enabledStats.forEach(s => cats.add(s.category));
    return Array.from(cats);
  }, [enabledStats]);

  // Default to the first category found
  const [expandedCategory, setExpandedCategory] = useState<StatCategory | null>(categories[0] || null);

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

  const getCategoryTotal = (cat: string) => {
    const catStats = groupedStats[cat] || [];
    return catStats.reduce((sum, stat) => sum + (setTotals[stat.id] || 0), 0);
  };

  const lastStat = set.logs[set.logs.length - 1];
  const lastStatLabel = lastStat ? DEFAULT_STATS.find(s => s.id === lastStat.statId)?.label : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Sub-Header for Match Info */}
      <div className="bg-white p-4 border-b flex items-center justify-between sticky sub-header-top z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-none">Set {set.setNumber}</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">vs {match.opponent}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {set.logs.length > 0 && (
            <button 
              onClick={onUndo}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl active:bg-slate-200 active:scale-90 transition-transform"
            >
              <RotateCcw size={20} />
            </button>
          )}
          <button 
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm ${set.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white'}`}
          >
            {set.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {set.isCompleted ? 'Done' : 'End'}
          </button>
        </div>
      </div>

      {/* Main Tracking Area */}
      <div className="p-4 space-y-3 pb-32">
        {set.isCompleted && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl text-xs text-center font-bold uppercase tracking-widest mb-4">
            Recording Paused: Set Complete
          </div>
        )}

        {categories.map((cat) => {
          const isOpen = expandedCategory === cat;
          const colors = CATEGORY_COLORS[cat];
          const catTotal = getCategoryTotal(cat);

          return (
            <div 
              key={cat} 
              className={`border-2 rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? `${colors.border} shadow-lg shadow-black/5` : 'border-slate-100 bg-white'}`}
            >
              <button
                onClick={() => setExpandedCategory(isOpen ? null : cat)}
                className={`w-full flex items-center justify-between p-5 transition-colors ${isOpen ? colors.bg : 'active:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${colors.text.replace('text', 'bg')}`}></div>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isOpen ? colors.text : 'text-slate-600'}`}>
                    {cat}
                  </h3>
                  {catTotal > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isOpen ? 'bg-white/50' : 'bg-slate-100 text-slate-500'}`}>
                      {catTotal}
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={20} className={colors.text} /> : <ChevronDown size={20} className="text-slate-300" />}
              </button>

              {isOpen && (
                <div className="p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {(groupedStats[cat] || []).map(stat => (
                    <button
                      key={stat.id}
                      disabled={set.isCompleted}
                      onClick={() => onRecord(stat.id)}
                      className={`relative flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all active:scale-[0.92]
                        ${set.isCompleted ? 'bg-slate-50 border-slate-100 opacity-40' : `bg-white border-slate-100 shadow-sm ${colors.btn}`}
                      `}
                    >
                      <span className={`text-2xl font-black mb-1 ${setTotals[stat.id] ? colors.text : 'text-slate-800'}`}>
                        {setTotals[stat.id] || 0}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight text-center leading-none">
                        {stat.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Minimized Activity Log */}
        {set.logs.length > 0 && (
          <div className="pt-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-2 mb-3">
              Last Actions
            </h3>
            <div className="space-y-2">
              {set.logs.slice(-2).reverse().map((log, i) => (
                <div key={log.id} className={`flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-slate-100 ${i === 0 ? 'ring-2 ring-indigo-500/10' : 'opacity-40'}`}>
                   <span className="text-xs font-bold text-slate-700">
                    {DEFAULT_STATS.find(s => s.id === log.statId)?.label}
                   </span>
                   <span className="text-[10px] text-slate-400 font-black tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Confirmation Toast */}
      {lastStatLabel && !set.isCompleted && (
        <div key={set.logs.length} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] font-black shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none uppercase tracking-[0.2em] border border-white/10 z-[60]">
          +1 {lastStatLabel}
        </div>
      )}
    </div>
  );
};

export default SetTracker;
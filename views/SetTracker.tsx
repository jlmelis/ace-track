import React, { useMemo } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { SetData, Match, PlayerProfile, DEFAULT_STATS, StatDefinition } from '../types.ts';

interface SetTrackerProps {
  set: SetData;
  match: Match;
  profile: PlayerProfile;
  onBack: () => void;
  onRecord: (statId: string) => void;
  onUndo: () => void;
  onToggleComplete: () => void;
}

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

  const handleRecord = (statId: string) => {
    onRecord(statId);
  };

  const lastStat = set.logs[set.logs.length - 1];
  const lastStatLabel = lastStat ? DEFAULT_STATS.find(s => s.id === lastStat.statId)?.label : null;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-4 border-b flex items-center justify-between sticky top-safe-offset z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-none">Set {set.setNumber}</h2>
            <p className="text-xs text-slate-500 mt-1">vs {match.opponent}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {set.logs.length > 0 && (
            <button 
              onClick={onUndo}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl active:bg-slate-200"
            >
              <RotateCcw size={20} />
            </button>
          )}
          <button 
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm ${set.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white'}`}
          >
            {set.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {set.isCompleted ? 'Done' : 'End'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {set.isCompleted && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl text-sm text-center font-bold">
            Set Marked as Complete
          </div>
        )}

        {(Object.entries(groupedStats) as [string, StatDefinition[]][]).map(([category, stats]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-1 flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
              {category}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(stat => (
                <button
                  key={stat.id}
                  disabled={set.isCompleted}
                  onClick={() => handleRecord(stat.id)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all active:scale-[0.9] active:shadow-inner
                    ${set.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 active:border-indigo-500 active:bg-indigo-50/50 shadow-sm'}
                  `}
                >
                  <span className="text-3xl font-black text-slate-800 mb-1">
                    {setTotals[stat.id] || 0}
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    {stat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {set.logs.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-1 mb-4">
              Live Feed
            </h3>
            <div className="space-y-3">
              {set.logs.slice(-3).reverse().map((log, i) => (
                <div key={log.id} className={`flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 ${i === 0 ? 'ring-2 ring-indigo-500/20 shadow-md' : 'opacity-50'}`}>
                   <span className="font-bold text-slate-800">
                    {DEFAULT_STATS.find(s => s.id === log.statId)?.label}
                   </span>
                   <span className="text-[10px] text-slate-400 font-black tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lastStatLabel && !set.isCompleted && (
        <div key={set.logs.length} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-black shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none uppercase tracking-widest border border-white/10">
          Logged: {lastStatLabel}
        </div>
      )}
    </div>
  );
};

export default SetTracker;
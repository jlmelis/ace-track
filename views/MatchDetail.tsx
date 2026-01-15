import React from 'react';
import { ArrowLeft, Plus, ChevronRight, Download, Activity, Target, Shield, Zap, LayoutGrid, Trash2 } from 'lucide-react';
import { Match, PlayerProfile, DEFAULT_STATS, StatCategory, CATEGORY_ORDER } from '../types.ts';

interface MatchDetailProps {
  match: Match;
  profile: PlayerProfile;
  onBack: () => void;
  onAddSet: () => void;
  onSelectSet: (id: string) => void;
  onDeleteSet: (id: string) => void;
}

const CATEGORY_ICONS: Record<StatCategory, React.ReactNode> = {
  'Attacking': <Zap size={12} />,
  'Serving': <Target size={12} />,
  'Defense': <Shield size={12} />,
  'Setting': <LayoutGrid size={12} />,
  'Blocking': <Activity size={12} />,
};

const CATEGORY_COLORS: Record<StatCategory, string> = {
  'Attacking': 'text-orange-600 bg-orange-50',
  'Serving': 'text-blue-600 bg-blue-50',
  'Defense': 'text-emerald-600 bg-emerald-50',
  'Setting': 'text-indigo-600 bg-indigo-50',
  'Blocking': 'text-slate-600 bg-slate-50',
};

const MatchDetail: React.FC<MatchDetailProps> = ({ match, profile, onBack, onAddSet, onSelectSet, onDeleteSet }) => {
  const getTotals = () => {
    const totals: Record<string, number> = {};
    match.sets.forEach(set => {
      set.logs.forEach(log => {
        totals[log.statId] = (totals[log.statId] || 0) + 1;
      });
    });
    return totals;
  };

  const totals = getTotals();

  // Efficiency Calculations
  const kills = totals['kill'] || 0;
  const attackErrors = totals['attack_err'] || 0;
  const attackAttempts = (totals['attack_attempt'] || 0) + (totals['attack_roll'] || 0) + (totals['attack_tip'] || 0);
  const totalAttacks = kills + attackErrors + attackAttempts;
  const hittingPercentage = totalAttacks > 0 ? (kills - attackErrors) / totalAttacks : 0;

  const handleExport = () => {
    const sanitize = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const headers = ['Set', 'Category', 'Metric', 'Timestamp'];
    const rows = match.sets.flatMap(set => 
      set.logs.map(log => {
        const statDef = DEFAULT_STATS.find(s => s.id === log.statId);
        return [
          `Set ${set.setNumber}`,
          statDef?.category || 'Other',
          statDef?.label || log.statId,
          new Date(log.timestamp).toLocaleString()
        ].map(sanitize);
      })
    );
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AceTrack_vs_${match.opponent.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between sticky sub-header-top z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">vs {match.opponent}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{match.date}</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-lg active:scale-95 transition-transform"
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      <div className="p-4 space-y-8">
        {/* 1. Sets Section (Moved to Top) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Match Sets</h3>
            <button 
              onClick={onAddSet}
              className="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px] bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform uppercase tracking-wider"
            >
              <Plus size={14} strokeWidth={3} />
              Track Set
            </button>
          </div>

          <div className="grid gap-2">
            {match.sets.length === 0 ? (
              <div className="text-center py-10 px-6 bg-white border border-dashed rounded-2xl border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No sets started</p>
              </div>
            ) : (
              match.sets.map(set => (
                <div 
                  key={set.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left flex items-stretch shadow-sm active:scale-[0.99] transition-transform group"
                >
                  <button 
                    onClick={() => onSelectSet(set.id)}
                    className="flex-1 p-4 text-left flex items-center justify-between active:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${set.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {set.setNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Set {set.setNumber}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {set.logs.length} Actions • {set.isCompleted ? 'Completed' : 'Live'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-active:text-indigo-400 transition-colors" size={20} />
                  </button>
                  <button 
                    onClick={() => onDeleteSet(set.id)}
                    className="bg-slate-50 px-4 border-l border-slate-100 text-slate-400 active:text-red-500 active:bg-red-50 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. Cumulative Stats Section (Moved to Bottom and Smaller) */}
        {match.sets.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Match Summary</h3>
            </div>

            {/* Hitting Percentage Highlight (Keep distinct but slightly smaller) */}
            {totalAttacks > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200 overflow-hidden relative">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em]">Efficiency Score</p>
                  <p className="text-[10px] text-slate-400 mt-1">K:{kills} | E:{attackErrors} | T:{totalAttacks}</p>
                </div>
                <div className="text-right relative z-10">
                  <p className={`text-2xl font-black ${hittingPercentage >= 0.3 ? 'text-emerald-400' : hittingPercentage >= 0.1 ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {hittingPercentage.toFixed(3)}
                  </p>
                </div>
              </div>
            )}

            {/* Comprehensive Stats Grid */}
            <div className="space-y-4">
              {CATEGORY_ORDER.map(cat => {
                const catStats = DEFAULT_STATS.filter(s => s.category === cat && totals[s.id]);
                if (catStats.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <div className={`p-1 rounded-md ${CATEGORY_COLORS[cat]}`}>
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cat}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {catStats.map(stat => (
                        <div key={stat.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate pr-2">
                            {stat.label}
                          </span>
                          <span className="text-xs font-black text-slate-800 tabular-nums">
                            {totals[stat.id] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MatchDetail;
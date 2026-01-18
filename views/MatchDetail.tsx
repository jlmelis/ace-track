import React from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ChevronRight, 
  Download, 
  Trash2,
  Swords, // Attacking
  Send,   // Serving
  Hand,   // Defense
  Orbit,  // Setting
  Fence   // Blocking
} from 'lucide-react';
import { Match, PlayerProfile, StatDefinition, StatCategory, CATEGORY_ORDER } from '../types.ts';

interface MatchDetailProps {
  match: Match;
  profile: PlayerProfile;
  onBack: () => void;
  onAddSet: () => void;
  onSelectSet: (id: string) => void;
  onDeleteSet: (id: string) => void;
  allStats: StatDefinition[];
}

const CATEGORY_ICONS: Record<StatCategory, React.ReactNode> = {
  'Attacking': <Swords size={14} strokeWidth={2.5} />,
  'Serving':   <Send size={14} strokeWidth={2.5} />,
  'Defense':   <Fence size={14} strokeWidth={2.5} />,
  'Setting':   <Orbit size={14} strokeWidth={2.5} />,
  'Blocking':  <Hand size={14} strokeWidth={2.5} />,
};

const CATEGORY_COLORS: Record<StatCategory, string> = {
  'Attacking': 'text-brand-primary-700 bg-brand-primary-50', // Steel Blue
  'Serving': 'text-brand-accent font-bold bg-brand-accent-light', // Energy Indigo
  'Defense': 'text-brand-success font-bold bg-brand-success-light', // Success Green
  'Setting': 'text-brand-primary-900 bg-brand-primary-200', // Deep Navy
  'Blocking': 'text-brand-neutral-500 bg-brand-neutral-50', // Slate
};

const MatchDetail: React.FC<MatchDetailProps> = ({ match, profile, onBack, onAddSet, onSelectSet, onDeleteSet, allStats }) => {
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
        const statDef = allStats.find(s => s.id === log.statId);
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
      {/* Header - Unified with Dashboard & Event Detail */}
      <div className="bg-white p-4 border-b border-brand-neutral-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-brand-neutral-500 active:text-brand-primary-900 rounded-full transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-neutral-800 truncate uppercase tracking-tight">vs {match.opponent}</h2>
            <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest leading-none mt-1">{match.date}</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 text-brand-primary-900 font-bold text-xs bg-brand-primary-50 px-3 py-2 rounded-lg border border-brand-primary-200 active:scale-95 transition-all"
        >
          <Download size={14} strokeWidth={3} />
          CSV
        </button>
      </div>

      <div className="p-4 space-y-8">
        {/* 1. Sets Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.2em]">Match Sets</h3>
            <button 
              onClick={onAddSet}
              className="flex items-center gap-1.5 text-white font-bold text-[11px] bg-brand-primary-900 px-4 py-2 rounded-full active:scale-95 transition-transform uppercase tracking-wider shadow-md"
            >
              <Plus size={14} strokeWidth={4} />
              Track Set
            </button>
          </div>

          <div className="grid gap-2">
            {match.sets.length === 0 ? (
              <div className="text-center py-10 px-6 bg-brand-neutral-50 border-2 border-dashed rounded-2xl border-brand-neutral-200">
                <p className="text-xs text-brand-neutral-400 font-bold uppercase tracking-widest">No sets started</p>
              </div>
            ) : (
              match.sets.map(set => (
                <div 
                  key={set.id}
                  className="bg-white border border-brand-neutral-200 rounded-2xl overflow-hidden text-left flex items-stretch shadow-sm active:scale-[0.99] transition-all group"
                >
                  <button 
                    onClick={() => onSelectSet(set.id)}
                    className="flex-1 p-4 text-left flex items-center justify-between active:bg-brand-primary-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                        set.isCompleted 
                        ? 'bg-brand-success-light text-brand-success border-brand-success/20' 
                        : 'bg-brand-accent-light text-brand-accent border-brand-accent/20 animate-pulse'
                      }`}>
                        {set.setNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-neutral-800 italic uppercase tracking-tight">Set {set.setNumber}</h4>
                        <p className="text-[10px] text-brand-neutral-500 font-bold uppercase tracking-wider">
                          {set.logs.length} Actions • <span className={set.isCompleted ? 'text-brand-success' : 'text-brand-accent'}>{set.isCompleted ? 'Completed' : 'Live'}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-brand-neutral-200 group-active:text-brand-primary-900" size={20} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => onDeleteSet(set.id)}
                    className="bg-brand-neutral-50 px-4 border-l border-brand-neutral-200 text-brand-neutral-400 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. Cumulative Stats Section */}
        {match.sets.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-brand-neutral-200">
            <div className="px-1">
              <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.2em]">Full Match Summary</h3>
            </div>

            {totalAttacks > 0 && (
              <div className="bg-brand-neutral-800 text-white rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-brand-primary-900/10 overflow-hidden relative">
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-brand-primary-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-brand-primary-400 uppercase tracking-[0.2em]">Efficiency Score</p>
                  <p className="text-[10px] text-brand-neutral-400 font-bold mt-1 uppercase">K:{kills} | E:{attackErrors} | T:{totalAttacks}</p>
                </div>
                <div className="text-right relative z-10">
                  <p className={`text-3xl font-black italic ${
                    hittingPercentage >= 0.3 ? 'text-brand-success' : 
                    hittingPercentage >= 0.1 ? 'text-brand-primary-400' : 
                    'text-brand-neutral-200'
                  }`}>
                    {hittingPercentage.toFixed(3)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {CATEGORY_ORDER.map(cat => {
                const catStats = allStats.filter(s => s.category === cat && totals[s.id]);
                if (catStats.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <div className={`p-1 rounded-md ${CATEGORY_COLORS[cat]}`}>
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <span className="text-[10px] font-black text-brand-neutral-500 uppercase tracking-widest">{cat}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {catStats.map(stat => (
                        <div key={stat.id} className="bg-white border border-brand-neutral-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <span className="text-[10px] font-bold text-brand-neutral-500 uppercase tracking-tight truncate pr-2">
                            {stat.label}
                          </span>
                          <span className="text-xs font-black text-brand-neutral-800 tabular-nums">
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
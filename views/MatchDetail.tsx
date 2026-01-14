
import React from 'react';
import { ArrowLeft, Plus, ChevronRight, Download } from 'lucide-react';
import { Match, DEFAULT_STATS } from '../types';

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
  onAddSet: () => void;
  onSelectSet: (id: string) => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack, onAddSet, onSelectSet }) => {
  
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

  // Advanced calculations for recruiters/coaches
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
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-200">
      <div className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">vs {match.opponent}</h2>
            <p className="text-xs text-slate-500">{match.date}</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-lg active:scale-95 transition-transform"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="p-4 space-y-6">
        {match.sets.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryStatBox label="Kills" value={kills} color="bg-orange-50 text-orange-600" />
              <SummaryStatBox label="Aces" value={totals['ace'] || 0} color="bg-blue-50 text-blue-600" />
              <SummaryStatBox label="Blocks" value={(totals['block_solo'] || 0) + (totals['block_assist'] || 0)} color="bg-indigo-50 text-indigo-600" />
              <SummaryStatBox label="Digs" value={totals['dig'] || 0} color="bg-emerald-50 text-emerald-600" />
            </div>
            
            {totalAttacks > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hitting Efficiency</p>
                  <p className="text-xs text-slate-300">K:{kills} | E:{attackErrors} | Att:{totalAttacks}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${hittingPercentage >= 0.3 ? 'text-emerald-400' : hittingPercentage >= 0.1 ? 'text-indigo-300' : 'text-slate-100'}`}>
                    {hittingPercentage.toFixed(3)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hitting %</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recorded Sets</h3>
          <button 
            onClick={onAddSet}
            className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-2 rounded-lg active:scale-95 transition-transform"
          >
            <Plus size={16} strokeWidth={3} />
            Track Set
          </button>
        </div>

        <div className="grid gap-3">
          {match.sets.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white border border-dashed rounded-xl border-slate-300">
              <p className="text-sm text-slate-500 font-medium">No sets recorded yet.</p>
            </div>
          ) : (
            match.sets.map(set => (
              <button 
                key={set.id}
                onClick={() => onSelectSet(set.id)}
                className="bg-white border border-slate-200 rounded-xl p-5 text-left flex items-center justify-between shadow-sm active:bg-slate-50 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Set {set.setNumber}</h4>
                    {set.isCompleted && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Done</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{set.logs.length} Total Stats Recorded</p>
                </div>
                <ChevronRight className="text-slate-300 group-active:text-indigo-400 transition-colors" size={24} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface SummaryStatBoxProps {
  label: string;
  value: number;
  color: string;
}

const SummaryStatBox: React.FC<SummaryStatBoxProps> = ({ label, value, color }) => (
  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center ${color} shadow-sm border border-black/5`}>
    <span className="text-2xl font-black">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
  </div>
);

export default MatchDetail;

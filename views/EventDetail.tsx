import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, ChevronRight, Activity, Calendar, Download, Trash2, Swords, Send, Fence, Orbit, Hand, ChevronDown, ChevronUp } from 'lucide-react';
import { Event, StatDefinition, aggregateTournamentStats, calculateTournamentEfficiencies, TournamentStats, CATEGORY_ORDER, StatCategory } from '../types';

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

interface TournamentStatsSectionProps {
  totals: Record<string, number>;
  efficiencies: Omit<TournamentStats, 'totals'>;
  allStats: StatDefinition[];
}

const TournamentStatsSection: React.FC<TournamentStatsSectionProps> = ({ totals, efficiencies, allStats }) => {
  const { hittingPercentage, kills, attackErrors, totalAttacks } = efficiencies;
  
  return (
    <section className="space-y-4 pt-4 border-t border-brand-neutral-200">
      <div className="px-1">
        <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.2em]">Tournament Summary</h3>
      </div>

      {totalAttacks > 0 && (
        <div className="bg-brand-neutral-800 text-white rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-brand-primary-900/10 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-brand-primary-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[9px] font-black text-brand-primary-400 uppercase tracking-[0.2em]">Tournament Efficiency</p>
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
  );
};

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onAddMatch: (opponent: string, date: string) => void;
  onSelectMatch: (id: string) => void;
  onDeleteMatch: (id: string) => void;
  allStats: StatDefinition[];
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onAddMatch, onSelectMatch, onDeleteMatch, allStats }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [opponent, setOpponent] = useState('');
  const [matchDate, setMatchDate] = useState(event.date); // Default to event start date
  const [showTournamentStats, setShowTournamentStats] = useState(true);

  const tournamentTotals = useMemo(() => aggregateTournamentStats(event), [event]);
  const tournamentEfficiencies = useMemo(() => calculateTournamentEfficiencies(tournamentTotals), [tournamentTotals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (opponent.trim()) {
      onAddMatch(opponent, matchDate);
      setOpponent('');
      setIsAdding(false);
    }
  };

  const handleExportTournament = () => {
    const sanitize = (val: string) => `"${val.replace(/"/g, '""')}"`;
    
    const headers = ['Match', 'Date', 'Set', 'Category', 'Metric', 'Timestamp'];
    const rows = event.matches.flatMap(match => 
      match.sets.flatMap(set => 
        set.logs.map(log => {
          const statDef = allStats.find(s => s.id === log.statId);
          return [
            match.opponent,
            match.date,
            `Set ${set.setNumber}`,
            statDef?.category || 'Other',
            statDef?.label || log.statId,
            new Date(log.timestamp).toLocaleString()
          ].map(sanitize);
        })
      )
    );
    
    if (rows.length === 0) {
      alert("No stats recorded yet for this tournament.");
      return;
    }

    // Add tournament totals section
    const tournamentRows = [];
    // Add empty row as separator
    tournamentRows.push(['', '', '', '', '', ''].map(sanitize));
    // Add section header
    tournamentRows.push(['TOURNAMENT TOTALS', '', '', '', '', ''].map(sanitize));
    
    // Add rows for each stat with non-zero total
    allStats.forEach(stat => {
      const total = tournamentTotals[stat.id] || 0;
      if (total > 0) {
        tournamentRows.push([
          'Tournament Total',
          '',
          '',
          stat.category,
          stat.label,
          total.toString()
        ].map(sanitize));
      }
    });

    const allCSVRows = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      ...tournamentRows.map(r => r.join(','))
    ];
    const csvContent = allCSVRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AceTrack_${event.name.replace(/\s+/g, '_')}_Full_Report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTournamentDate = () => {
    const start = new Date(event.date + 'T00:00:00');
    if (event.endDate) {
      const end = new Date(event.endDate + 'T00:00:00');
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

return (
    <div className="animate-in slide-in-from-right-4 duration-200">
      <div className="bg-white p-4 border-b border-brand-neutral-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="p-1 -ml-1 text-brand-neutral-500 active:text-brand-primary-900 rounded-full transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-neutral-800 truncate uppercase tracking-tight leading-tight">{event.name}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-brand-neutral-500 uppercase tracking-widest">
              <span>{formatTournamentDate()}</span>
              <span className="opacity-30">•</span>
              <span className="truncate">{event.location || 'No Location'}</span>
            </div>
          </div>
        </div>
        {event.matches.some(m => m.sets.some(s => s.logs.length > 0)) && (
          <button onClick={handleExportTournament} className="flex items-center gap-1.5 text-brand-primary-900 font-bold text-xs bg-brand-primary-50 px-3 py-2 rounded-lg active:scale-95 transition-all">
            <Download size={14} strokeWidth={3} />
            REPORT
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {event.matches.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-brand-neutral-500 uppercase tracking-widest">Tournament Stats</h3>
              <button 
                onClick={() => setShowTournamentStats(!showTournamentStats)}
                className="p-1 text-brand-neutral-400 hover:text-brand-primary-900 transition-colors"
              >
                {showTournamentStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            {showTournamentStats && (
              <TournamentStatsSection 
                totals={tournamentTotals}
                efficiencies={tournamentEfficiencies}
                allStats={allStats}
              />
            )}
          </>
        )}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-brand-neutral-500 uppercase tracking-widest">Matches</h3>
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-1.5 text-white font-bold text-sm bg-brand-primary-900 px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform">
            <Plus size={18} strokeWidth={3} />
            NEW MATCH
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white border border-brand-neutral-200 rounded-2xl p-4 shadow-xl shadow-brand-primary-900/5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Opponent Team</label>
                <input autoFocus required value={opponent} onChange={(e) => setOpponent(e.target.value)} className="w-full bg-brand-neutral-50 border-0 rounded-xl p-3 outline-none ring-1 ring-brand-neutral-200 focus:ring-2 focus:ring-brand-primary-900 transition-all" placeholder="e.g. Eagles Academy" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Match Date</label>
                <input type="date" required value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="w-full bg-brand-neutral-50 border-0 rounded-xl p-3 outline-none ring-1 ring-brand-neutral-200 focus:ring-2 focus:ring-brand-primary-900 transition-all" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-brand-primary-900 text-white font-bold py-3 rounded-xl shadow-lg active:bg-black transition-colors">
                START TRACKING
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 text-brand-neutral-500 font-bold text-sm">
                CANCEL
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-3">
          {event.matches.length === 0 ? (
            <div className="text-center py-12 px-6 bg-brand-neutral-50 border-2 border-dashed rounded-2xl border-brand-neutral-200">
              <Activity size={32} className="mx-auto text-brand-neutral-200 mb-2" />
              <p className="text-sm text-brand-neutral-500 font-bold uppercase tracking-tight">No matches recorded</p>
            </div>
          ) : (
            [...event.matches].sort((a,b) => b.date.localeCompare(a.date)).map(match => (
              <div key={match.id} className="bg-white border border-brand-neutral-200 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex">
                <button onClick={() => onSelectMatch(match.id)} className="flex-1 p-5 text-left flex items-center justify-between group">
                  <div className="space-y-1">
                    <h4 className="font-black text-brand-neutral-800 text-lg italic uppercase tracking-tight">vs {match.opponent}</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-bold text-brand-neutral-500">
                        <Calendar size={14} className="text-brand-primary-400" strokeWidth={2.5} />
                        {new Date(match.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-brand-primary-900 font-black bg-brand-primary-50 px-2 py-0.5 rounded-md">
                        {match.sets.length} SETS
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-brand-neutral-200 group-hover:text-brand-primary-900 group-active:translate-x-1 transition-all" size={24} strokeWidth={3} />
                </button>
                <button onClick={() => onDeleteMatch(match.id)} className="bg-brand-neutral-50 px-5 border-l border-brand-neutral-200 text-brand-neutral-500 hover:text-red-500 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
import React, { useState } from 'react';
import { ArrowLeft, Plus, ChevronRight, Activity, Calendar, Download, Trash2 } from 'lucide-react';
import { Event, StatDefinition } from '../types';

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

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
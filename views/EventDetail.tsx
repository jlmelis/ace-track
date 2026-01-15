import React, { useState } from 'react';
import { ArrowLeft, Plus, ChevronRight, Activity, Calendar, Download, Trash2 } from 'lucide-react';
import { Event, DEFAULT_STATS } from '../types';

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onAddMatch: (opponent: string, date: string) => void;
  onSelectMatch: (id: string) => void;
  onDeleteMatch: (id: string) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onAddMatch, onSelectMatch, onDeleteMatch }) => {
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
          const statDef = DEFAULT_STATS.find(s => s.id === log.statId);
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
      <div className="bg-white p-4 border-b flex items-center justify-between sticky sub-header-top z-40 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full shrink-0">
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate leading-tight">{event.name}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{formatTournamentDate()}</span>
              <span className="opacity-30">•</span>
              <span className="truncate">{event.location || 'No Location'}</span>
            </div>
          </div>
        </div>
        {event.matches.some(m => m.sets.some(s => s.logs.length > 0)) && (
          <button 
            onClick={handleExportTournament}
            className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-lg active:scale-95 transition-transform shrink-0"
          >
            <Download size={16} />
            Report
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Matches</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <Plus size={16} strokeWidth={3} />
            New Match
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm shadow-indigo-50 space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opponent Team</label>
                <input 
                  autoFocus
                  required
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  placeholder="e.g. Eagles Academy"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Match Date</label>
                <input 
                  type="date"
                  required
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md shadow-indigo-100"
              >
                Add Match
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 text-slate-500 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-3">
          {event.matches.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white border border-dashed rounded-xl border-slate-300">
              <div className="text-slate-300 mb-2">
                <Activity size={32} className="mx-auto" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No matches tracked for this event.</p>
            </div>
          ) : (
            [...event.matches].sort((a,b) => b.date.localeCompare(a.date)).map(match => (
              <div 
                key={match.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform flex"
              >
                <button 
                  onClick={() => onSelectMatch(match.id)}
                  className="flex-1 p-4 text-left flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">vs {match.opponent}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(match.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        {match.sets.length} Sets
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-active:text-indigo-400" size={20} />
                </button>
                <button 
                  onClick={() => onDeleteMatch(match.id)}
                  className="bg-slate-50 px-4 border-l border-slate-100 text-slate-400 active:text-red-500 active:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
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
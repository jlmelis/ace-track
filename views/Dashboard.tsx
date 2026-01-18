import React, { useState } from 'react';
import { Plus, Trophy, MapPin, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { Event } from '../types';

interface DashboardProps {
  events: Event[];
  onAddEvent: (name: string, loc: string, date: string, endDate?: string) => void;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ events, onAddEvent, onSelectEvent, onDeleteEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  
  // Helper to get local YYYY-MM-DD
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newDate, setNewDate] = useState(getLocalDate());
  const [newEndDate, setNewEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddEvent(newName, newLoc, newDate, newEndDate || undefined);
      setNewName('');
      setNewLoc('');
      setNewDate(getLocalDate());
      setNewEndDate('');
      setIsAdding(false);
    }
  };

  const formatEventDate = (event: Event) => {
    const start = new Date(event.date + 'T00:00:00');
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    if (event.endDate) {
      const end = new Date(event.endDate + 'T00:00:00');
      const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      // If same month/year, could condense but simple is safe
      return `${startStr} - ${endStr}`;
    }
    
    return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-neutral-800 uppercase tracking-tight">Tournaments</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-primary-900 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-neutral-200 rounded-xl p-4 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Tournament Name</label>
            <input 
              autoFocus required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-brand-neutral-50 border-0 rounded-lg p-3 outline-none ring-1 ring-brand-neutral-200 focus:ring-2 focus:ring-brand-primary-900 transition-all"
              placeholder="e.g. State Championship"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-brand-primary-900 text-white font-bold py-3 rounded-lg shadow-md active:bg-black transition-colors">
              Add Tournament
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 text-brand-neutral-500 font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {events.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="bg-brand-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary-400">
              <Trophy size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-brand-neutral-800">No events yet</h3>
            <p className="text-sm text-brand-neutral-500 mt-1">Tap the plus button to add your first tournament.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform flex">
              <button onClick={() => onSelectEvent(event.id)} className="flex-1 p-4 text-left flex items-center justify-between group">
                <div className="space-y-1">
                  <h3 className="font-bold text-brand-neutral-800 text-lg">{event.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-brand-primary-600" strokeWidth={2.5} />
                      {formatEventDate(event)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-brand-primary-400" />
                      {event.location || 'Unknown Location'}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-brand-primary-900 bg-brand-primary-50 px-2 py-0.5 rounded">
                      {event.matches.length} Matches
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-brand-neutral-200 group-active:text-brand-primary-900" size={24} strokeWidth={3} />
              </button>
              <button onClick={() => onDeleteEvent(event.id)} className="bg-brand-neutral-50 px-4 border-l border-brand-neutral-200 text-brand-neutral-500 active:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
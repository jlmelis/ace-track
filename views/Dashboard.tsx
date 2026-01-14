
import React, { useState } from 'react';
import { Plus, Trophy, MapPin, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { Event } from '../types';

interface DashboardProps {
  events: Event[];
  onAddEvent: (name: string, loc: string) => void;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ events, onAddEvent, onSelectEvent, onDeleteEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddEvent(newName, newLoc);
      setNewName('');
      setNewLoc('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Tournaments</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tournament Name</label>
            <input 
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-shadow"
              placeholder="e.g. State Championship"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
            <input 
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-shadow"
              placeholder="e.g. City Arena"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg active:bg-indigo-700 transition-colors"
            >
              Add Event
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
        {events.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Trophy size={32} />
            </div>
            <h3 className="font-semibold text-slate-700">No events yet</h3>
            <p className="text-sm text-slate-500 mt-1">Tap the plus button to add your first tournament.</p>
          </div>
        ) : (
          events.map(event => (
            <div 
              key={event.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform flex"
            >
              <button 
                onClick={() => onSelectEvent(event.id)}
                className="flex-1 p-4 text-left flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800">{event.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {event.matches.length} Matches
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-active:text-indigo-400" size={20} />
              </button>
              <button 
                onClick={() => onDeleteEvent(event.id)}
                className="bg-slate-50 px-4 border-l border-slate-100 text-slate-400 active:text-red-500 active:bg-red-50 transition-colors"
              >
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

import React from 'react';
import { Activity, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { Match } from '../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface MatchListProps {
    matches: Match[];
    onSelectMatch: (id: string) => void;
    onDeleteMatch: (id: string) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onSelectMatch, onDeleteMatch }) => {
    if (matches.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-brand-neutral-50 border-2 border-dashed rounded-2xl border-brand-neutral-200">
                <Activity size={32} className="mx-auto text-brand-neutral-200 mb-2" />
                <p className="text-sm text-brand-neutral-500 font-bold uppercase tracking-tight">No matches recorded</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {[...matches].sort((a, b) => b.date.localeCompare(a.date)).map(match => (
                <Card key={match.id} className="p-0 flex-row gap-0 border-brand-neutral-200 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-all flex">
                    <button onClick={() => onSelectMatch(match.id)} className="flex-1 p-5 text-left flex items-center justify-between group bg-transparent">
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
                    <Button variant="ghost" onClick={() => onDeleteMatch(match.id)} className="h-auto rounded-none bg-brand-neutral-50 px-5 border-l border-brand-neutral-200 text-brand-neutral-500 hover:text-red-500 hover:bg-brand-neutral-100 transition-all">
                        <Trash2 size={20} />
                    </Button>
                </Card>
            ))}
        </div>
    );
};

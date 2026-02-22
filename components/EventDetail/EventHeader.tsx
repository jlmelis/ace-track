import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Event } from '../../types';
import { Button } from '../ui/button';

interface EventHeaderProps {
    event: Event;
    onBack: () => void;
    onExport: () => void;
    canExport: boolean;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event, onBack, onExport, canExport }) => {
    const formatTournamentDate = () => {
        const start = new Date(event.date + 'T00:00:00');
        if (event.endDate) {
            const end = new Date(event.endDate + 'T00:00:00');
            return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="bg-white p-4 border-b border-brand-neutral-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-brand-neutral-500 rounded-full hover:bg-brand-neutral-50 transition-colors">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </Button>
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-brand-neutral-800 truncate uppercase tracking-tight leading-tight">{event.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-neutral-500 uppercase tracking-widest">
                        <span>{formatTournamentDate()}</span>
                        <span className="opacity-30">•</span>
                        <span className="truncate">{event.location || 'No Location'}</span>
                    </div>
                </div>
            </div>
            {canExport && (
                <Button variant="outline" onClick={onExport} className="gap-1.5 text-brand-primary-900 font-bold text-xs bg-brand-primary-50 border-brand-primary-200 hover:bg-brand-primary-100">
                    <Download size={14} strokeWidth={3} />
                    REPORT
                </Button>
            )}
        </div>
    );
};

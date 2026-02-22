import React, { useState } from 'react';

interface CreateMatchFormProps {
    initialDate: string;
    onSubmit: (opponent: string, date: string) => void;
    onCancel: () => void;
}

export const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ initialDate, onSubmit, onCancel }) => {
    const [opponent, setOpponent] = useState('');
    const [matchDate, setMatchDate] = useState(initialDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (opponent.trim()) {
            onSubmit(opponent, matchDate);
            // parent might choose to unmount this, but reset state anyway
            setOpponent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-neutral-200 rounded-2xl p-4 shadow-xl shadow-brand-primary-900/5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Opponent Team</label>
                    <input
                        autoFocus
                        required
                        value={opponent}
                        onChange={(e) => setOpponent(e.target.value)}
                        className="w-full bg-brand-neutral-50 border-0 rounded-xl p-3 outline-none ring-1 ring-brand-neutral-200 focus:ring-2 focus:ring-brand-primary-900 transition-all"
                        placeholder="e.g. Eagles Academy"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Match Date</label>
                    <input
                        type="date"
                        required
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                        className="w-full bg-brand-neutral-50 border-0 rounded-xl p-3 outline-none ring-1 ring-brand-neutral-200 focus:ring-2 focus:ring-brand-primary-900 transition-all"
                    />
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-brand-primary-900 text-white font-bold py-3 rounded-xl shadow-lg active:bg-black transition-colors">
                    START TRACKING
                </button>
                <button type="button" onClick={onCancel} className="px-4 text-brand-neutral-500 font-bold text-sm">
                    CANCEL
                </button>
            </div>
        </form>
    );
};

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

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
        <Card className="border-brand-neutral-200 rounded-2xl shadow-xl shadow-brand-primary-900/5 animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Opponent Team</label>
                            <Input
                                autoFocus
                                required
                                value={opponent}
                                onChange={(e) => setOpponent(e.target.value)}
                                className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all"
                                placeholder="e.g. Eagles Academy"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-brand-primary-700 uppercase tracking-wider ml-1">Match Date</label>
                            <Input
                                type="date"
                                required
                                value={matchDate}
                                onChange={(e) => setMatchDate(e.target.value)}
                                className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all font-sans"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1 font-bold h-12 rounded-xl shadow-lg uppercase tracking-wider text-xs">
                            START TRACKING
                        </Button>
                        <Button variant="ghost" type="button" onClick={onCancel} className="px-4 text-brand-neutral-500 hover:text-brand-neutral-700 hover:bg-transparent font-bold text-sm h-12">
                            CANCEL
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

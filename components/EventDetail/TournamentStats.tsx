import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Swords, Send, Fence, Orbit, Hand } from 'lucide-react';
import { StatDefinition, TournamentStats as ITournamentStats, CATEGORY_ORDER, StatCategory } from '../../types';

const CATEGORY_ICONS: Record<StatCategory, React.ReactNode> = {
    'Attacking': <Swords size={14} strokeWidth={2.5} />,
    'Serving': <Send size={14} strokeWidth={2.5} />,
    'Defense': <Fence size={14} strokeWidth={2.5} />,
    'Setting': <Orbit size={14} strokeWidth={2.5} />,
    'Blocking': <Hand size={14} strokeWidth={2.5} />,
};

const CATEGORY_COLORS: Record<StatCategory, string> = {
    'Attacking': 'text-brand-primary-700 bg-brand-primary-50',
    'Serving': 'text-brand-accent font-bold bg-brand-accent-light',
    'Defense': 'text-brand-success font-bold bg-brand-success-light',
    'Setting': 'text-brand-primary-900 bg-brand-primary-200',
    'Blocking': 'text-brand-neutral-500 bg-brand-neutral-50',
};

interface TournamentStatsProps {
    totals: Record<string, number>;
    efficiencies: Omit<ITournamentStats, 'totals'>;
    allStats: StatDefinition[];
}

export const TournamentStats: React.FC<TournamentStatsProps> = ({ totals, efficiencies, allStats }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { hittingPercentage, kills, attackErrors, totalAttacks } = efficiencies;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-brand-neutral-500 uppercase tracking-widest">Tournament Stats</h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-brand-neutral-400 hover:text-brand-primary-900 transition-colors"
                >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {isExpanded && (
                <section className="space-y-4 pt-4 border-t border-brand-neutral-200 animate-in fade-in slide-in-from-top-2 duration-200">
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
                                <p className={`text-3xl font-black italic ${hittingPercentage >= 0.3 ? 'text-brand-success' :
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
            )}
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Event, StatDefinition, aggregateTournamentStats, calculateTournamentEfficiencies } from '../types';
import { useTournamentExport } from '../hooks/useTournamentExport';
import { EventHeader } from '../components/EventDetail/EventHeader';
import { TournamentStats } from '../components/EventDetail/TournamentStats';
import { CreateMatchForm } from '../components/EventDetail/CreateMatchForm';
import { MatchList } from '../components/EventDetail/MatchList';
import { Button } from '../components/ui/button';

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

  const tournamentTotals = useMemo(() => aggregateTournamentStats(event), [event]);
  const tournamentEfficiencies = useMemo(() => calculateTournamentEfficiencies(tournamentTotals), [tournamentTotals]);

  const { exportTournament } = useTournamentExport({ event, allStats, tournamentTotals });

  const hasStatsToExport = event.matches.some(m => m.sets.some(s => s.logs.length > 0));

  const handleCreateMatch = (opponent: string, matchDate: string) => {
    onAddMatch(opponent, matchDate);
    setIsAdding(false);
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-200">
      <EventHeader
        event={event}
        onBack={onBack}
        onExport={exportTournament}
        canExport={hasStatsToExport}
      />

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-brand-neutral-500 uppercase tracking-widest">Matches</h3>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="gap-1.5 font-bold text-sm rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={3} />
            NEW MATCH
          </Button>
        </div>

        {isAdding && (
          <CreateMatchForm
            initialDate={event.date}
            onSubmit={handleCreateMatch}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <MatchList
          matches={event.matches}
          onSelectMatch={onSelectMatch}
          onDeleteMatch={onDeleteMatch}
        />

        {event.matches.length > 0 && (
          <TournamentStats
            totals={tournamentTotals}
            efficiencies={tournamentEfficiencies}
            allStats={allStats}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetail;
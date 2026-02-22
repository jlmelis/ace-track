import { Event, StatDefinition, TournamentStats } from '../types';

interface UseTournamentExportProps {
  event: Event;
  allStats: StatDefinition[];
  tournamentTotals: Record<string, number>;
}

export const useTournamentExport = ({ event, allStats, tournamentTotals }: UseTournamentExportProps) => {
  const exportTournament = () => {
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

    // Add tournament totals section
    const tournamentRows = [];
    // Add empty row as separator
    tournamentRows.push(['', '', '', '', '', ''].map(sanitize));
    // Add section header
    tournamentRows.push(['TOURNAMENT TOTALS', '', '', '', '', ''].map(sanitize));
    
    // Add rows for each stat with non-zero total
    allStats.forEach(stat => {
      const total = tournamentTotals[stat.id] || 0;
      if (total > 0) {
        tournamentRows.push([
          'Tournament Total',
          '',
          '',
          stat.category,
          stat.label,
          total.toString()
        ].map(sanitize));
      }
    });

    const allCSVRows = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      ...tournamentRows.map(r => r.join(','))
    ];
    const csvContent = allCSVRows.join('\n');
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

  return { exportTournament };
};

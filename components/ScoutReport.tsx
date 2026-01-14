import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, BrainCircuit, X, Loader2, Trophy, Target, TrendingUp } from 'lucide-react';
import { Match, PlayerProfile, DEFAULT_STATS } from '../types.ts';

interface ScoutReportProps {
  match: Match;
  profile: PlayerProfile;
  onClose: () => void;
}

const ScoutReport: React.FC<ScoutReportProps> = ({ match, profile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const totals: Record<string, number> = {};
      match.sets.forEach(set => {
        set.logs.forEach(log => {
          totals[log.statId] = (totals[log.statId] || 0) + 1;
        });
      });

      const statsString = Object.entries(totals).map(([id, count]) => {
        const label = DEFAULT_STATS.find(s => s.id === id)?.label || id;
        return `${label}: ${count}`;
      }).join(', ');

      const prompt = `You are a high-level NCAA volleyball coach. Analyze these stats for ${profile.name} (Position: ${profile.position}) in their match vs ${match.opponent}:
      
      STATS RECORDED: ${statsString || 'No stats recorded yet.'}
      
      Provide a "Pro Scout Report" for the parent/player.
      Include:
      1. Top Performance Highlight (What went well)
      2. Tactical Opportunity (One thing to look for next match)
      3. Practice Focus (Specific technical drill recommendation)
      4. A "Recruiter's Perspective" (How these stats translate to higher level play)
      
      Keep it professional, encouraging, and clear. Format in concise bullet points. Max 200 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setReport(response.text || "Analysis complete. Keep up the hard work!");
    } catch (error) {
      console.error(error);
      setReport("The scouting system is currently offline. Focus on consistent fundamentals!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pro Scout Analysis</h3>
              <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">vs {match.opponent}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!report && !loading && (
            <div className="text-center space-y-6 py-8">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="text-indigo-600 animate-pulse" size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-lg">Ready for Analysis?</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Gemini will analyze your daughter's hitting efficiency, serving accuracy, and defensive contributions to provide professional coaching feedback.
                </p>
              </div>
              <button 
                onClick={generateReport}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <TrendingUp size={20} />
                Generate Scout Report
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="text-indigo-600 animate-spin" size={40} />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Analyzing match tape...</p>
            </div>
          )}

          {report && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-slate prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                  {report}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                  <Trophy className="text-emerald-600 shrink-0" size={20} />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase leading-tight">Elite Potential</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                  <Target className="text-amber-600 shrink-0" size={20} />
                  <span className="text-[10px] font-bold text-amber-800 uppercase leading-tight">High Ceiling</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full border-2 border-slate-100 text-slate-500 font-bold py-3 rounded-2xl active:bg-slate-50 transition-colors"
              >
                Back to Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoutReport;
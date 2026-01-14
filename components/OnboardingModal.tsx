
import React from 'react';
import { Shield, Download, Zap, Trophy, Check } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="bg-indigo-600 p-8 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden">
             <Trophy size={200} className="-rotate-12 -ml-10 -mt-10" />
          </div>
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Zap size={32} className="fill-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome to AceTrack</h2>
          <p className="text-indigo-100 text-sm mt-2 font-medium">The pro-grade stat tracker for your daughter's volleyball journey.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl h-fit">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">No Login, Total Privacy</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We don't use servers. All stats are stored <strong>locally on this phone</strong>. No accounts, no tracking, just performance.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl h-fit">
              <Download size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Export to Save</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Since data is local, remember to <strong>Export to CSV</strong> after matches. It’s the best way to keep a permanent record and share with coaches.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl h-fit">
              <Trophy size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Hitting Efficiency</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Record attacks that stay in play to automatically calculate true Hitting Percentage—the stat recruiters care about most.
              </p>
            </div>
          </div>

          <button 
            onClick={onDismiss}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200 mt-4"
          >
            <Check size={20} strokeWidth={3} />
            Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

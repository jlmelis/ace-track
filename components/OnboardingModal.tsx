import React from 'react';
import { Shield, Download, Zap, Trophy, Check } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-500 max-h-[90vh] flex flex-col">
        {/* Header Section - Height Reduced */}
        <div className="bg-indigo-600 p-5 text-center text-white relative shrink-0">
          <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Zap size={24} className="fill-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight leading-tight">Welcome to AceTrack</h2>
          <p className="text-indigo-100 text-[11px] mt-1 font-medium px-4">Pro stat tracking for your daughter's volleyball journey.</p>
        </div>
        
        {/* Features Section - More compact padding and gaps */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg h-fit shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">No Login, Total Privacy</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                All stats are stored <strong>locally on this phone</strong>. No accounts or tracking, just her performance.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg h-fit shrink-0">
              <Download size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Export to Save</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Data is local. <strong>Export to CSV</strong> after matches to keep a permanent record and share with coaches.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg h-fit shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Hitting Efficiency</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Record attacks to automatically calculate Hitting Percentage—the key stat recruiters care about.
              </p>
            </div>
          </div>

          <button 
            onClick={onDismiss}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200 mt-2 shrink-0"
          >
            <Check size={18} strokeWidth={3} />
            Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
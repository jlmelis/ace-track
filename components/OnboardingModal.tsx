import React from 'react';
import { Hand, Download, Swords, Trophy, Check } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-neutral-800/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-500 max-h-[90vh] flex flex-col">
        
        {/* Header Section - Deep Navy AceTrack Theme */}
        <div className="bg-brand-primary-900 p-6 text-center text-white relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
            <Swords size={28} strokeWidth={2.5} className="text-white" />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight leading-tight">AceTrack</h2>
          <p className="text-brand-primary-200 text-[11px] mt-1 font-bold uppercase tracking-widest px-4">
            Volleyball Performance Tracking
          </p>
        </div>
        
        {/* Features Section */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Privacy Feature */}
          <div className="flex gap-4">
            <div className="bg-brand-success-light text-brand-success p-2 rounded-xl h-fit shrink-0">
              <Hand size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-brand-neutral-800 text-xs uppercase italic">Total Privacy</h4>
              <p className="text-[11px] text-brand-neutral-500 mt-1 leading-relaxed font-medium">
                Stats are stored <strong>locally on your device</strong>. No accounts or tracking—just her data, kept private.
              </p>
            </div>
          </div>

          {/* Export Feature */}
          <div className="flex gap-4">
            <div className="bg-brand-primary-50 text-brand-primary-600 p-2 rounded-xl h-fit shrink-0">
              <Download size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-brand-neutral-800 text-xs uppercase italic">Export & Share</h4>
              <p className="text-[11px] text-brand-neutral-500 mt-1 leading-relaxed font-medium">
                Data is local. <strong>Export to CSV</strong> after tournaments to share performance reports with coaches and recruiters.
              </p>
            </div>
          </div>

          {/* Efficiency Feature */}
          <div className="flex gap-4">
            <div className="bg-brand-primary-900/5 text-brand-primary-900 p-2 rounded-xl h-fit shrink-0">
              <Trophy size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-brand-neutral-800 text-xs uppercase italic">Pro Metrics</h4>
              <p className="text-[11px] text-brand-neutral-500 mt-1 leading-relaxed font-medium">
                Track attempts and kills to automatically calculate <strong>Hitting Efficiency</strong>—the gold standard for recruiters.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={onDismiss}
            className="w-full bg-brand-primary-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-brand-primary-900/20 mt-4 uppercase tracking-[0.2em] text-xs italic"
          >
            <Check size={18} strokeWidth={4} />
            Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
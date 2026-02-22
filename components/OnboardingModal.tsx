import React from 'react';
import { Hand, Download, Swords, Trophy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onDismiss }) => {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="p-0 overflow-hidden rounded-[2rem] max-w-sm border-0 shadow-2xl bg-white flex flex-col gap-0 outline-none [&>button]:hidden">
        <DialogTitle className="sr-only">Welcome to AceTrack</DialogTitle>

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
          <Button
            onClick={onDismiss}
            className="w-full font-black h-14 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-brand-primary-900/20 mt-4 uppercase tracking-[0.2em] text-xs italic"
          >
            <Check size={18} strokeWidth={4} />
            Let's Play
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
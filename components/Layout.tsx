import React from 'react';
import { Home, Settings, Trophy, Activity } from 'lucide-react';
import VersionDisplay from './VersionDisplay.tsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (v: any) => void;
  playerName: string;
  hasActiveSet: boolean;
  version?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, playerName, hasActiveSet, version }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        Fixed Header ensures it stays at the very top.
        pt-safe handles the camera notch.
        h-[calc(var(--header-base-height)+env(safe-area-inset-top))] ensures the background fills the whole top.
      */}
       <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-100 pt-safe px-4 flex items-center justify-between" style={{ height: 'calc(var(--header-base-height) + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
            <div className=" p-1.5 rounded-lg">
              <img src="/icon.png" alt="AceTrack Icon" style={{ width: 30, height: 30 }} />
            </div>
          <div>
            <h1 className="text-base font-bold leading-none">AceTrack</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{playerName}</p>
          </div>
        </div>
        <button 
          onClick={() => setView('settings')}
          className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'bg-brand-primary-50 text-brand-primary' : 'text-slate-200 active:bg-slate-100'}`}
        >
          <Settings size={22} />
        </button>
      </header>

      {/* Main Content with top offset to clear the fixed header */}
      <main className="flex-1 content-top-offset pb-24">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-100">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavButton 
            active={currentView === 'dashboard' || currentView === 'event' || currentView === 'match'} 
            icon={<Home size={22} />} 
            label="Home" 
            onClick={() => setView('dashboard')} 
          />
          <div className="flex flex-col items-center justify-center">
            <VersionDisplay version={version} className="text-center" />
          </div>
          <NavButton 
            active={currentView === 'set'} 
            icon={<Trophy size={22} />} 
            label="Live Track" 
            onClick={() => setView('set')}
            disabled={!hasActiveSet}
          />
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${disabled ? 'opacity-20 grayscale' : ''} ${active ? 'text-brand-primary font-semibold' : 'text-slate-200'}`}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-wide">{label}</span>
  </button>
);

export default Layout;
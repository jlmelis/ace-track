import React from 'react';
import { Home, Settings, Trophy, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (v: any) => void;
  playerName: string;
  hasActiveSet: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, playerName, hasActiveSet }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Notch Protection */}
      <header className="bg-white border-b sticky top-0 z-50 pt-safe px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">AceTrack</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{playerName}</p>
          </div>
        </div>
        <button 
          onClick={() => setView('settings')}
          className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 active:bg-slate-100'}`}
        >
          <Settings size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavButton 
            active={currentView === 'dashboard' || currentView === 'event' || currentView === 'match'} 
            icon={<Home size={22} />} 
            label="Home" 
            onClick={() => setView('dashboard')} 
          />
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
    className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${disabled ? 'opacity-20 grayscale' : ''} ${active ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-wide">{label}</span>
  </button>
);

export default Layout;
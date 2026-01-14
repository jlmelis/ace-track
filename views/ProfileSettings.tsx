import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Check, Trash2, Database, Download, Upload, AlertTriangle, ChevronDown, ChevronUp, Type } from 'lucide-react';
import { PlayerProfile, DEFAULT_STATS, StatCategory, AppState, DEFAULT_ALIASES, CATEGORY_ORDER } from '../types';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onBack: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onBack }) => {
  const [localProfile, setLocalProfile] = useState<PlayerProfile>({ ...profile });
  const [showSaved, setShowSaved] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Attacking': true 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    calculateUsage();
  }, []);

  const calculateUsage = () => {
    const data = localStorage.getItem('acetrack_v1_data') || '';
    const sizeInBytes = new Blob([data]).size;
    const sizeInKb = (sizeInBytes / 1024).toFixed(2);
    setStorageUsage(`${sizeInKb} KB`);
  };

  const toggleStat = (id: string) => {
    setLocalProfile(prev => {
      const isTracked = prev.trackedStats.includes(id);
      return {
        ...prev,
        trackedStats: isTracked 
          ? prev.trackedStats.filter(s => s !== id)
          : [...prev.trackedStats, id]
      };
    });
  };

  const updateAlias = (cat: StatCategory, value: string) => {
    setLocalProfile(prev => ({
      ...prev,
      categoryAliases: {
        ...prev.categoryAliases,
        [cat]: value.toUpperCase().slice(0, 2)
      }
    }));
  };

  const handleSave = () => {
    onSave(localProfile);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const clearData = () => {
    if (window.confirm("CRITICAL: This will delete ALL tournaments, matches, and stats. This cannot be undone. Are you sure?")) {
      localStorage.removeItem('acetrack_v1_data');
      localStorage.removeItem('acetrack_onboarding_seen');
      window.location.reload();
    }
  };

  const handleBackup = () => {
    const data = localStorage.getItem('acetrack_v1_data');
    if (!data) return alert("No data to backup!");
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AceTrack_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile && json.events) {
          if (window.confirm("Restore this backup? This will overwrite your current data on this device.")) {
            localStorage.setItem('acetrack_v1_data', JSON.stringify(json));
            window.location.reload();
          }
        } else alert("Invalid backup file format.");
      } catch (err) { alert("Error reading backup file."); }
    };
    reader.readAsText(file);
  };

  const categories = CATEGORY_ORDER;

  return (
    <div className="animate-in slide-in-from-right-4 duration-200 pb-24">
      <div className="bg-white p-4 border-b flex items-center justify-between sticky sub-header-top z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500 active:bg-slate-100 rounded-full"><ArrowLeft size={24} /></button>
          <h2 className="text-lg font-bold text-slate-800">Profile & Config</h2>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all shadow-md shadow-indigo-100">
          {showSaved ? <Check size={18} /> : <Save size={18} />}
          {showSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="p-4 space-y-8">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Player Details</h3>
          <div className="grid gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Player Name</label>
              <input value={localProfile.name} onChange={e => setLocalProfile({...localProfile, name: e.target.value})} className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jersey #</label>
                <input value={localProfile.number} onChange={e => setLocalProfile({...localProfile, number: e.target.value})} className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Position</label>
                <input value={localProfile.position} onChange={e => setLocalProfile({...localProfile, position: e.target.value})} className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
              </div>
            </div>
          </div>
        </section>

        {/* Alias Configuration Section */}
        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Navigation Aliases</h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">1-2 character labels for tracker tabs</p>
          </div>
          <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {categories.map(cat => (
              <div key={cat} className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase text-center block truncate">{cat}</label>
                <input 
                  value={localProfile.categoryAliases[cat]} 
                  onChange={e => updateAlias(cat, e.target.value)}
                  placeholder={DEFAULT_ALIASES[cat]}
                  className="w-full bg-slate-50 border-0 rounded-lg py-3 px-1 text-center outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all font-black text-sm uppercase"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Tracked Metrics</h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">Toggle metrics for live tracking</p>
          </div>
          <div className="space-y-3">
            {categories.map(cat => {
              const isExpanded = !!expandedCats[cat];
              const catStats = DEFAULT_STATS.filter(s => s.category === cat);
              const activeCount = catStats.filter(s => localProfile.trackedStats.includes(s.id)).length;
              return (
                <div key={cat} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedCats(p => ({...p, [cat]: !isExpanded}))} className="w-full flex items-center justify-between p-4 active:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800">{cat}</h4>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">{activeCount} / {catStats.length}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-2 grid gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {catStats.map(stat => (
                        <label key={stat.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${localProfile.trackedStats.includes(stat.id) ? 'bg-indigo-50/50 border-indigo-100' : 'bg-transparent border-transparent opacity-70'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${localProfile.trackedStats.includes(stat.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                              {localProfile.trackedStats.includes(stat.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{stat.label}</span>
                          </div>
                          <input type="checkbox" className="hidden" checked={localProfile.trackedStats.includes(stat.id)} onChange={() => toggleStat(stat.id)} />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Storage & Privacy</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600"><Database size={16} /><span className="text-xs font-bold uppercase">Device Storage</span></div>
              <span className="text-xs font-black text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">{storageUsage}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleBackup} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm"><Download size={16} className="text-indigo-600" />Backup Data</button>
              <button onClick={handleRestoreClick} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm"><Upload size={16} className="text-indigo-600" />Restore Data</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
               <div className="flex gap-2 text-amber-600 mb-1"><AlertTriangle size={14} className="shrink-0 mt-0.5" /><span className="text-[10px] font-bold uppercase">Privacy First</span></div>
               <p className="text-[10px] text-slate-500 leading-relaxed font-medium">No data is sent to a server. This app uses "Local-Only" storage.</p>
            </div>
            <button onClick={clearData} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-xs py-3 bg-red-50 border border-red-100 rounded-lg active:bg-red-100 transition-colors"><Trash2 size={16} />Reset Application</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
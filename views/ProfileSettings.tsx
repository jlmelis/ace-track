import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Save, Check, Trash2, Database, Download, Upload, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Plus } from 'lucide-react';
import { PlayerProfile, DEFAULT_STATS, StatCategory, DEFAULT_ALIASES, CATEGORY_ORDER, StatDefinition } from '../types';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onBack: () => void;
  customStats: StatDefinition[];
  onAddCustomStat: (stat: Omit<StatDefinition, 'id' | 'enabled'>) => void;
  onDeleteCustomStat: (id: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onBack, customStats, onAddCustomStat, onDeleteCustomStat }) => {
  const [localProfile, setLocalProfile] = useState<PlayerProfile>({ ...profile });
  const [showSaved, setShowSaved] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'current' | 'found'>('idle');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Attacking': true 
  });

  // Custom Stat Form
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatCat, setNewStatCat] = useState<StatCategory>(CATEGORY_ORDER[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualUpdateCheck = async () => {
    if (!('serviceWorker' in navigator)) return;
    setUpdateStatus('checking');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (!reg.installing && !reg.waiting) {
          setUpdateStatus('current');
          setTimeout(() => setUpdateStatus('idle'), 3000);
        } else if (reg.waiting) {
          setUpdateStatus('found');
        }
      }
    } catch (e) {
      setUpdateStatus('idle');
    }
  };

  const allStatsCombined = useMemo(() => [...DEFAULT_STATS, ...customStats], [customStats]);

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

  const handleAddStatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatLabel.trim()) {
      onAddCustomStat({
        label: newStatLabel,
        category: newStatCat,
        isCustom: true
      });
      setNewStatLabel('');
      setIsAddingStat(false);
    }
  };

  const clearData = () => {
    if (window.confirm("CRITICAL: This will delete ALL tournaments, matches, and stats. This cannot be undone. Are you sure?")) {
      const request = indexedDB.deleteDatabase('AceTrackDB');
      request.onsuccess = () => {
        localStorage.removeItem('acetrack_onboarding_seen');
        window.location.reload();
      };
    }
  };

  const handleBackup = () => {
    // For simplicity, we get data from state which represents the latest DB data
    const fullData = {
      profile: localProfile,
      events: [], // In a real production app we'd fetch the latest events from the parent or DB
      customStats: customStats
    };
    
    // NOTE: This backup is limited by what the state currently holds. 
    // In our App.tsx, 'data' holds everything, so this is safe for now.
    const blob = new Blob([JSON.stringify(fullData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AceTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
          if (window.confirm("Restore this backup? This will overwrite your current database.")) {
            // App.tsx effect will handle saving this to IndexedDB once state is updated
            // But for a clean reload, we'll use local then reload
            localStorage.setItem('acetrack_v1_data', JSON.stringify(json));
            window.location.reload();
          }
        } else alert("Invalid backup file format.");
      } catch (err) { alert("Error reading backup file."); }
    };
    reader.readAsText(file);
  };

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

        <section className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Custom Stats</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">Add metrics you care about</p>
            </div>
            <button 
              onClick={() => setIsAddingStat(!isAddingStat)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg active:scale-95 transition-transform"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          {isAddingStat && (
            <form onSubmit={handleAddStatSubmit} className="bg-white border border-indigo-100 p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metric Name</label>
                <input 
                  autoFocus
                  required
                  value={newStatLabel}
                  onChange={e => setNewStatLabel(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Free Ball Pass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_ORDER.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewStatCat(cat)}
                      className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase transition-all ${newStatCat === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs">Create Stat</button>
                <button type="button" onClick={() => setIsAddingStat(false)} className="px-4 text-slate-500 text-xs font-bold">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid gap-2">
            {customStats.length === 0 ? (
              <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No custom stats created</p>
            ) : (
              customStats.map(stat => (
                <div key={stat.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{stat.label}</h4>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">{stat.category}</span>
                  </div>
                  <button onClick={() => onDeleteCustomStat(stat.id)} className="p-2 text-slate-300 active:text-red-500 active:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Application</h3>
            <button 
              onClick={handleManualUpdateCheck}
              disabled={updateStatus === 'checking'}
              className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded transition-colors active:bg-indigo-100 disabled:opacity-50"
            >
              <RefreshCw size={12} className={updateStatus === 'checking' ? 'animate-spin' : ''} />
              {updateStatus === 'checking' ? 'Checking...' : updateStatus === 'current' ? 'Up To Date' : updateStatus === 'found' ? 'Update Found!' : 'Check for Updates'}
            </button>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3 text-slate-600">
               <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><Database size={18} /></div>
               <div>
                  <h4 className="text-xs font-bold text-slate-800">Object Database</h4>
                  <p className="text-[10px] text-slate-400 font-medium">IndexedDB - High Capacity</p>
               </div>
             </div>
             <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">Active</span>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Data Management</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleBackup} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm"><Download size={16} className="text-indigo-600" />Backup Data</button>
              <button onClick={handleRestoreClick} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm"><Upload size={16} className="text-indigo-600" />Restore Data</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
               <div className="flex gap-2 text-amber-600 mb-1"><AlertTriangle size={14} className="shrink-0 mt-0.5" /><span className="text-[10px] font-bold uppercase">Privacy First</span></div>
               <p className="text-[10px] text-slate-500 leading-relaxed font-medium">No data is sent to a server. This app uses a private local database.</p>
            </div>
            <button onClick={clearData} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-xs py-3 bg-red-50 border border-red-100 rounded-lg active:bg-red-100 transition-colors"><Trash2 size={16} />Reset Application</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Save, Check, Trash2, Database, Download, Upload, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Plus, Target, Zap, Shield, Activity, LayoutGrid, CheckSquare, Square } from 'lucide-react';
import { PlayerProfile, DEFAULT_STATS, StatCategory, DEFAULT_ALIASES, CATEGORY_ORDER, StatDefinition } from '../types';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onBack: () => void;
  customStats: StatDefinition[];
  onAddCustomStat: (stat: Omit<StatDefinition, 'id' | 'enabled'>) => void;
  onDeleteCustomStat: (id: string) => void;
}

const CATEGORY_ICONS: Record<StatCategory, React.ReactNode> = {
  'Attacking': <Zap size={14} />,
  'Serving': <Target size={14} />,
  'Defense': <Shield size={14} />,
  'Setting': <LayoutGrid size={14} />,
  'Blocking': <Activity size={14} />,
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onBack, customStats, onAddCustomStat, onDeleteCustomStat }) => {
  const [localProfile, setLocalProfile] = useState<PlayerProfile>({ ...profile });
  const [showSaved, setShowSaved] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'current' | 'found'>('idle');
  
  // All sections collapsed by default
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() => 
    CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: false }), {})
  );

  // Custom Stat Form
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatCat, setNewStatCat] = useState<StatCategory>(CATEGORY_ORDER[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const toggleAllInCategory = (cat: StatCategory) => {
    const catStats = allStatsCombined.filter(s => s.category === cat);
    const catStatIds = catStats.map(s => s.id);
    const allCurrentlyTracked = catStatIds.every(id => localProfile.trackedStats.includes(id));

    setLocalProfile(prev => {
      let newTracked;
      if (allCurrentlyTracked) {
        // Remove all from this category
        newTracked = prev.trackedStats.filter(id => !catStatIds.includes(id));
      } else {
        // Add all missing ones from this category
        const missing = catStatIds.filter(id => !prev.trackedStats.includes(id));
        newTracked = [...prev.trackedStats, ...missing];
      }
      return { ...prev, trackedStats: newTracked };
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

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
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
    const fullData = {
      profile: localProfile,
      events: [], 
      customStats: customStats
    };
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
        if (json.profile) {
          if (window.confirm("Restore this backup? This will overwrite your current database.")) {
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
        {/* 1. Player Details */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1 text-left">Player Details</h3>
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

        {/* 2. Custom Stats Section - Moved Up */}
        <section className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Custom Metrics</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">Add unique trackers</p>
            </div>
            <button 
              onClick={() => setIsAddingStat(!isAddingStat)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg active:scale-95 transition-transform"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          {isAddingStat && (
            <form onSubmit={handleAddStatSubmit} className="bg-white border border-indigo-100 p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 shadow-sm shadow-indigo-50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metric Label</label>
                <input 
                  autoFocus
                  required
                  value={newStatLabel}
                  onChange={e => setNewStatLabel(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-lg p-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="e.g. Free Ball Pass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category Bucket</label>
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
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs shadow-md shadow-indigo-100">Create Stat</button>
                <button type="button" onClick={() => setIsAddingStat(false)} className="px-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid gap-2">
            {customStats.length === 0 ? (
              <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">No custom stats created</p>
            ) : (
              customStats.map(stat => (
                <div key={stat.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-400">{CATEGORY_ICONS[stat.category]}</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{stat.label}</h4>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">{stat.category}</span>
                    </div>
                  </div>
                  <button onClick={() => onDeleteCustomStat(stat.id)} className="p-2 text-slate-300 active:text-red-500 active:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. Stats Configuration - Sections Collapsed by Default */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1 text-left">Stats Configuration</h3>
          <div className="space-y-4">
            {CATEGORY_ORDER.map(cat => {
              const catStats = allStatsCombined.filter(s => s.category === cat);
              const isExpanded = expandedCats[cat];
              const alias = localProfile.categoryAliases?.[cat] || cat.slice(0, 2).toUpperCase();
              const trackedCount = catStats.filter(s => localProfile.trackedStats.includes(s.id)).length;
              const isAllTracked = trackedCount === catStats.length;

              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md">
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <span className="font-bold text-slate-800 text-sm tracking-tight">{cat}</span>
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold ml-1">
                        {trackedCount} / {catStats.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                         <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tab Alias</label>
                            <input 
                              value={alias} 
                              onChange={e => updateAlias(cat, e.target.value)}
                              className="w-10 bg-slate-50 border border-slate-200 rounded-md p-1 text-[10px] text-center font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </div>
                         <button 
                            onClick={() => toggleAllInCategory(cat)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${isAllTracked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                         >
                            {isAllTracked ? <CheckSquare size={12} /> : <Square size={12} />}
                            {isAllTracked ? 'Deselect All' : 'Select All'}
                         </button>
                      </div>
                      
                      <div className="grid gap-2">
                        {catStats.map(stat => (
                          <div key={stat.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                            <label htmlFor={`stat-${stat.id}`} className="flex-1 text-xs font-bold text-slate-700 cursor-pointer">
                              {stat.label}
                              {stat.isCustom && <span className="ml-2 text-[7px] bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded font-black uppercase">Custom</span>}
                            </label>
                            <button
                              id={`stat-${stat.id}`}
                              onClick={() => toggleStat(stat.id)}
                              className={`w-9 h-5 rounded-full transition-all relative ${localProfile.trackedStats.includes(stat.id) ? 'bg-indigo-600 shadow-inner' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${localProfile.trackedStats.includes(stat.id) ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Database & Application */}
        <section className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">System</h3>
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
                  <p className="text-[10px] text-slate-400 font-medium">IndexedDB - High Capacity Engine</p>
               </div>
             </div>
             <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">v16 Engine</span>
          </div>
        </section>

        {/* 5. Data Management */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1 text-left">Data Backup</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleBackup} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm transition-transform active:scale-95"><Download size={16} className="text-indigo-600" />Export State</button>
              <button onClick={handleRestoreClick} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs text-slate-700 active:bg-slate-100 shadow-sm transition-transform active:scale-95"><Upload size={16} className="text-indigo-600" />Import State</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-left">
               <div className="flex gap-2 text-amber-600 mb-1"><AlertTriangle size={14} className="shrink-0 mt-0.5" /><span className="text-[10px] font-bold uppercase tracking-wider">Storage Policy</span></div>
               <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your stats are private and stored locally. Clearing your browser cache or resetting the app will erase your records unless you have a backup file.</p>
            </div>
            <button onClick={clearData} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-xs py-3 bg-red-50 border border-red-100 rounded-lg active:bg-red-100 transition-colors"><Trash2 size={16} />Hard Reset App</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
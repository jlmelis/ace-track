import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  Trash2,
  Database,
  Download,
  Upload,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  CheckSquare,
  Square,
  Swords,
  Send,
  Hand,
  Orbit,
  Fence
} from 'lucide-react';
import { PlayerProfile, DEFAULT_STATS, StatCategory, DEFAULT_ALIASES, CATEGORY_ORDER, StatDefinition } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onBack: () => void;
  customStats: StatDefinition[];
  onAddCustomStat: (stat: Omit<StatDefinition, 'id' | 'enabled'>) => void;
  onDeleteCustomStat: (id: string) => void;
}

const CATEGORY_ICONS: Record<StatCategory, React.ReactNode> = {
  'Attacking': <Swords size={14} strokeWidth={2.5} />,
  'Serving': <Send size={14} strokeWidth={2.5} />,
  'Defense': <Fence size={14} strokeWidth={2.5} />,
  'Setting': <Orbit size={14} strokeWidth={2.5} />,
  'Blocking': <Hand size={14} strokeWidth={2.5} />,
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
    <div className="animate-in slide-in-from-right-4 duration-200 pb-24 bg-brand-neutral-50 min-h-screen">
      {/* Header - Unified with Dashboard/Event/Match details */}
      <div className="bg-white p-4 border-b border-brand-neutral-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-brand-neutral-500 rounded-full hover:bg-brand-neutral-50 transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </Button>
          <h2 className="text-lg font-bold text-brand-neutral-800 uppercase tracking-tight">Settings</h2>
        </div>
        <Button
          onClick={handleSave}
          className="font-bold text-sm shadow-lg shadow-brand-primary-900/20"
        >
          {showSaved ? <Check size={18} strokeWidth={3} /> : <Save size={18} />}
          {showSaved ? 'SAVED' : 'SAVE'}
        </Button>
      </div>

      <div className="p-4 space-y-8">
        {/* 1. Player Details */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em] px-1">Player Profile</h3>
          <Card className="p-0 gap-0 border-brand-neutral-200 rounded-2xl shadow-sm">
            <CardContent className="grid gap-4 p-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-primary-700 uppercase tracking-wider ml-1">Full Name</label>
                <Input
                  value={localProfile.name}
                  onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })}
                  className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all font-bold text-brand-neutral-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary-700 uppercase tracking-wider ml-1">Jersey #</label>
                  <Input
                    value={localProfile.number}
                    onChange={e => setLocalProfile({ ...localProfile, number: e.target.value })}
                    className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all font-bold text-brand-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary-700 uppercase tracking-wider ml-1">Position</label>
                  <Input
                    value={localProfile.position}
                    onChange={e => setLocalProfile({ ...localProfile, position: e.target.value })}
                    className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all font-bold text-brand-neutral-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Custom Metrics */}
        <section className="space-y-3">
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em]">Custom Metrics</h3>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsAddingStat(!isAddingStat)}
              className="bg-brand-primary-50 text-brand-primary-900 rounded-xl border-brand-primary-200 shadow-none hover:bg-brand-primary-100"
            >
              <Plus size={20} strokeWidth={3} />
            </Button>
          </div>

          {isAddingStat && (
            <Card className="p-0 gap-0 border-2 border-brand-primary-200 rounded-2xl shadow-xl shadow-brand-primary-900/5 animate-in zoom-in-95">
              <CardContent className="p-0">
                <form onSubmit={handleAddStatSubmit} className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-brand-primary-700 uppercase tracking-wider ml-1">Metric Name</label>
                    <Input
                      autoFocus required
                      value={newStatLabel}
                      onChange={e => setNewStatLabel(e.target.value)}
                      className="w-full bg-brand-neutral-50 h-10 border-0 rounded-xl outline-none ring-1 ring-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-900 transition-all font-bold"
                      placeholder="e.g. Dig to Target"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary-700 uppercase tracking-wider ml-1">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORY_ORDER.map(cat => (
                        <Button
                          key={cat} type="button"
                          variant={newStatCat === cat ? "default" : "outline"}
                          onClick={() => setNewStatCat(cat)}
                          className={`h-auto py-2 rounded-lg text-[9px] font-black uppercase ${newStatCat !== cat && "bg-brand-neutral-50 text-brand-neutral-400 border-brand-neutral-200"}`}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 font-black py-5 rounded-xl text-xs shadow-lg uppercase tracking-widest">Create</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsAddingStat(false)} className="px-4 text-brand-neutral-500 text-[10px] font-black py-5 uppercase tracking-widest hover:bg-transparent hover:text-brand-neutral-600">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-2">
            {customStats.length === 0 ? (
              <p className="text-[10px] text-brand-neutral-400 uppercase tracking-widest text-center py-8 bg-brand-neutral-50 rounded-2xl border-2 border-dashed border-brand-neutral-200 font-bold">No custom metrics</p>
            ) : (
              customStats.map(stat => (
                <Card key={stat.id} className="p-4 flex-row gap-0 border-brand-neutral-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-primary-50 p-2.5 rounded-xl text-brand-primary-600">{CATEGORY_ICONS[stat.category]}</div>
                    <div>
                      <h4 className="text-sm font-black text-brand-neutral-800 uppercase italic">{stat.label}</h4>
                      <span className="text-[9px] font-black text-brand-primary-400 uppercase tracking-widest">{stat.category}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteCustomStat(stat.id)} className="text-brand-neutral-300 hover:text-red-500 hover:bg-brand-neutral-50">
                    <Trash2 size={18} />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* 3. Stats Configuration */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em] px-1">Tracking Configuration</h3>
          <div className="space-y-3">
            {CATEGORY_ORDER.map(cat => {
              const catStats = allStatsCombined.filter(s => s.category === cat);
              const isExpanded = expandedCats[cat];
              const alias = localProfile.categoryAliases?.[cat] || cat.slice(0, 2).toUpperCase();
              const trackedCount = catStats.filter(s => localProfile.trackedStats.includes(s.id)).length;
              const isAllTracked = trackedCount === catStats.length;

              return (
                <Card key={cat} className="p-0 gap-0 border-brand-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between p-4 bg-brand-neutral-50/50 active:bg-brand-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-brand-primary-900 text-white p-1.5 rounded-lg">
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <span className="font-black text-brand-neutral-800 text-sm uppercase italic tracking-tight">{cat}</span>
                      <span className="text-[10px] bg-brand-primary-600 text-white px-2 py-0.5 rounded-full font-black ml-1">
                        {trackedCount}/{catStats.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-brand-neutral-400" /> : <ChevronDown size={20} className="text-brand-neutral-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-5 animate-in slide-in-from-top-1 duration-200">
                      <div className="pt-4 flex items-center justify-between border-t border-brand-neutral-100">
                        <div className="flex items-center gap-2">
                          <label className="text-[9px] font-black text-brand-neutral-400 uppercase tracking-widest">Tab ID</label>
                          <Input
                            value={alias}
                            onChange={e => updateAlias(cat, e.target.value)}
                            className="w-14 bg-brand-primary-50 h-8 border-2 border-brand-primary-200 rounded-lg text-xs text-center font-black text-brand-primary-900 uppercase focus-visible:ring-2 focus-visible:ring-brand-primary-900 shadow-none"
                          />
                        </div>
                        <Button
                          onClick={() => toggleAllInCategory(cat)}
                          variant={isAllTracked ? "default" : "outline"}
                          className={`h-8 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm gap-1.5 px-3`}
                        >
                          {isAllTracked ? <CheckSquare size={14} strokeWidth={3} /> : <Square size={14} strokeWidth={3} />}
                          {isAllTracked ? 'Reset' : 'Check All'}
                        </Button>
                      </div>

                      <div className="grid gap-1">
                        {catStats.map(stat => {
                          const isTracked = localProfile.trackedStats.includes(stat.id);
                          return (
                            <div key={stat.id} className="flex items-center justify-between p-3 hover:bg-brand-neutral-50 rounded-xl transition-colors">
                              <label htmlFor={`stat-${stat.id}`} className="flex-1 text-xs font-bold text-brand-neutral-700 uppercase tracking-tight cursor-pointer">
                                {stat.label}
                                {stat.isCustom && <span className="ml-2 text-[8px] bg-brand-primary-50 text-brand-primary-600 px-1.5 py-0.5 rounded font-black uppercase">Custom</span>}
                              </label>
                              <button
                                id={`stat-${stat.id}`}
                                onClick={() => toggleStat(stat.id)}
                                className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${isTracked ? 'bg-brand-primary-900' : 'bg-brand-neutral-200 shadow-inner'}`}
                              >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isTracked ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. System Info */}
        <section className="space-y-3">
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em]">System</h3>
            <button
              onClick={handleManualUpdateCheck}
              disabled={updateStatus === 'checking'}
              className="flex items-center gap-1.5 text-[9px] font-black text-brand-primary-900 uppercase tracking-widest bg-brand-primary-50 px-3 py-1.5 rounded-lg transition-all active:scale-95 border border-brand-primary-200"
            >
              <RefreshCw size={12} className={updateStatus === 'checking' ? 'animate-spin' : ''} strokeWidth={3} />
              {updateStatus === 'checking' ? 'Checking...' : updateStatus === 'current' ? 'Latest Version' : 'Update Check'}
            </button>
          </div>
          <div className="bg-brand-neutral-800 p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 text-white relative z-10">
              <div className="bg-white/10 text-brand-primary-400 p-3 rounded-xl backdrop-blur-sm border border-white/5"><Database size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase italic tracking-wider">AceTrack v1.0.10</h4>
                <p className="text-[10px] text-brand-neutral-400 font-bold uppercase tracking-widest">IndexedDB Local Storage</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-brand-primary-400 border border-brand-primary-400/30 px-3 py-1 rounded-full relative z-10">ENCRYPTED</span>
          </div>
        </section>

        {/* 5. Data Management */}
        <section className="space-y-4 pt-6 border-t border-brand-neutral-200">
          <h3 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-[0.25em] px-1">Storage & Backup</h3>
          <Card className="p-0 gap-0 border-brand-neutral-200 rounded-2xl shadow-sm">
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleBackup} className="h-12 rounded-xl font-black text-[10px] text-brand-neutral-700 uppercase tracking-widest shadow-sm gap-2 whitespace-normal leading-tight">
                  <Download size={16} className="text-brand-primary-600" strokeWidth={2.5} />
                  Backup
                </Button>
                <Button variant="outline" onClick={handleRestoreClick} className="h-12 rounded-xl font-black text-[10px] text-brand-neutral-700 uppercase tracking-widest shadow-sm gap-2 whitespace-normal leading-tight">
                  <Upload size={16} className="text-brand-primary-600" strokeWidth={2.5} />
                  Restore
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-900 leading-relaxed font-bold uppercase tracking-tight">Your data is stored locally. If you clear browser cache without a backup, all stats will be lost.</p>
              </div>
              <Button variant="outline" onClick={clearData} className="w-full h-14 bg-red-50 hover:bg-red-100 border-red-100 text-red-600 hover:text-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-none">
                <Trash2 size={16} strokeWidth={2.5} />
                Factory Reset App
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
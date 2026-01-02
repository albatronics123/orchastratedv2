
import React, { useState, useEffect } from 'react';
import { UserProfile, LLMKey, PlatformType } from '../types';
import { PLATFORMS } from '../constants';
import { unipileService } from '../services/unipileService';

interface SettingsProps {
  user: UserProfile;
  onNavigate: (page: string) => void;
  llmKeys: LLMKey[];
  onAddKey: (key: Omit<LLMKey, 'id' | 'createdAt'>) => void;
  onRemoveKey: (id: string) => void;
  onSetDefault: (id: string) => void;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  onNavigate, 
  llmKeys, 
  onAddKey, 
  onRemoveKey, 
  onSetDefault,
  onUpdateUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [unipileAccounts, setUnipileAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'platforms') {
      loadUnipileStatus();
    }
  }, [activeTab]);

  const loadUnipileStatus = async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await unipileService.getAccounts();
      setUnipileAccounts(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleConnect = async (type: string) => {
    setIsConnecting(type);
    try {
      const response = await unipileService.createHostedConnection(type);
      if (response.url) {
        window.open(response.url, 'unipile-connect', 'width=600,height=800');
        alert("Volg de instructies in het nieuwe venster. Klik op 'Refresh' in dit scherm zodra je klaar bent!");
      }
    } catch (err) {
      alert("Fout bij het genereren van de koppel-link.");
    } finally {
      setIsConnecting(null);
    }
  };

  const tabs = [
    { id: 'platforms', label: 'Platforms', icon: 'hub' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] flex-shrink-0 border-r border-border-light dark:border-border-dark flex flex-col p-6 bg-surface-light dark:bg-surface-dark transition-colors duration-300 z-20">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-widest text-primary uppercase">Orchestrated</h1>
        </div>
        
        <div className="flex items-center gap-3 mb-8 p-3 bg-background-light dark:bg-surface-highlight rounded-xl border border-border-light dark:border-border-dark">
          <img alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary" src={user.avatar_url} />
          <div className="text-left">
            <p className="text-sm font-semibold truncate max-w-[120px]">{user.name}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => onNavigate('dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-surface-highlight hover:text-primary transition-colors group">
            <span className="material-icons-outlined group-hover:text-primary transition-colors">home</span>
            <span className="font-medium text-sm">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
            <span className="material-icons-outlined text-lg">tune</span>
            <span className="text-sm">Settings</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-border-light dark:border-border-dark space-y-2 mt-auto">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:text-red-400 transition-colors text-left">
            <span className="material-icons-outlined text-lg transform rotate-180">logout</span>
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="flex-shrink-0 px-10 py-8 z-10">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Settings</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-1">Beheer je verbindingen en profiel.</p>
          </div>
          
          <div className="border-b border-border-light dark:border-border-dark">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all relative ${
                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-20 z-10 scrollbar-hide text-left">
          {activeTab === 'platforms' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Actieve Koppelingen</h3>
                <button onClick={loadUnipileStatus} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                  <span className={`material-icons-outlined text-sm ${isLoadingAccounts ? 'animate-spin' : ''}`}>refresh</span>
                  Refresh Status
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORMS.map(p => {
                  const connected = unipileAccounts.find(acc => 
                    acc.type === p.type.toUpperCase() || 
                    (p.type === 'whatsapp' && acc.type === 'WHATSAPP') ||
                    (p.type === 'google_calendar' && acc.type === 'GOOGLE')
                  );
                  return (
                    <div key={p.type} className={`bg-surface-dark border p-6 rounded-2xl relative transition-all ${connected ? 'border-primary/40 shadow-gold-glow' : 'border-border-dark'}`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-background-dark border border-border-dark flex items-center justify-center">
                          <span className="material-icons-outlined" style={{ color: p.color }}>{p.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold">{p.name}</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${connected ? 'text-green-500' : 'text-text-muted-dark'}`}>
                            {connected ? 'Verbonden' : 'Niet Gekoppeld'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-text-muted-dark mb-6 leading-relaxed">
                        {connected ? `Je ${p.name} account is succesvol gesynchroniseerd.` : `Koppel je ${p.name} om alle data hier te ontvangen.`}
                      </p>

                      <button 
                        onClick={() => !connected && handleConnect(p.type)}
                        disabled={!!connected || isConnecting === p.type}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${connected ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary text-background-dark hover:bg-primary-hover shadow-gold-glow'}`}
                      >
                        {isConnecting === p.type ? 'Linking...' : connected ? 'Account Actief' : `Koppel ${p.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-md space-y-6 animate-in fade-in duration-300">
               <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Profiel Gegevens</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-muted-dark mb-2">Naam</label>
                      <input 
                        type="text" 
                        value={user.name}
                        disabled
                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm opacity-50" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-muted-dark mb-2">Email</label>
                      <input 
                        type="text" 
                        value={user.email}
                        disabled
                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm opacity-50" 
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;

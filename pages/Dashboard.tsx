
import React, { useState, useEffect } from 'react';
import { UserProfile, Conversation, Message, LLMKey, Suggestion, PlatformType } from '../types';
import { PLATFORMS } from '../constants';
import { generateSuggestions } from '../services/geminiService';
import { unipileService } from '../services/unipileService';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  llmKeys: LLMKey[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout, llmKeys }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'calendar'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'messages') {
        const chatsData = await unipileService.getChats();
        const mappedChats: Conversation[] = (chatsData.items || []).map((item: any) => ({
          id: item.id,
          platform: item.account_type?.toLowerCase() as PlatformType,
          contactName: item.name || 'Unknown Contact',
          contactAvatar: item.image || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`,
          lastMessage: item.last_message?.text || 'No messages yet',
          lastMessageTime: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unreadCount: item.unread_count || 0
        }));
        setConversations(mappedChats);
        if (mappedChats.length > 0 && !selectedConvId) {
          setSelectedConvId(mappedChats[0].id);
        }
      } else {
        const eventsData = await unipileService.getEvents();
        setEvents(eventsData.items || []);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (selectedConvId && activeTab === 'messages') {
      const loadMessages = async () => {
        const msgData = await unipileService.getMessages(selectedConvId);
        const mappedMsgs: Message[] = (msgData.items || []).map((m: any) => ({
          id: m.id,
          conversationId: selectedConvId,
          sender: m.sender_type === 'USER' ? 'user' : 'contact',
          content: m.text,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })).reverse();
        
        setMessages(mappedMsgs);
        setSuggestions([]);
        if (mappedMsgs.length > 0) fetchAISuggestions(mappedMsgs);
      };
      loadMessages();
    }
  }, [selectedConvId, activeTab]);

  const fetchAISuggestions = async (currentMessages: Message[]) => {
    if (currentMessages.length === 0) return;
    setIsGenerating(true);
    try {
      const results = await generateSuggestions(currentMessages);
      setSuggestions(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConvId) return;
    const text = messageInput;
    setMessageInput('');
    try {
      await unipileService.sendMessage(selectedConvId, text);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        conversationId: selectedConvId,
        sender: 'user',
        content: text,
        timestamp: 'Just now'
      }]);
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleConnectPlatform = async (type: string) => {
    setIsConnecting(type);
    try {
      const response = await unipileService.createHostedConnection(type);
      if (response.url) {
        window.open(response.url, '_blank', 'width=600,height=800');
      }
    } catch (err) {
      alert("Fout bij het maken van verbinding.");
    } finally {
      setIsConnecting(null);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-300 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] flex-shrink-0 border-r border-border-light dark:border-border-dark flex flex-col p-6 bg-surface-light dark:bg-surface-dark">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-widest text-primary uppercase">Orchestrated</h1>
          <div className="mt-1 flex items-center gap-1 text-[8px] text-primary/60 font-bold uppercase tracking-[0.2em]">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            Unified Hub
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-8 p-3 bg-background-light dark:bg-surface-highlight rounded-xl border border-border-light dark:border-border-dark">
          <img alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary" src={user.avatar_url} />
          <div className="overflow-hidden text-left">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <div className="flex items-center text-[10px] text-text-muted-dark uppercase font-bold tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Connected
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'text-text-muted-dark hover:text-primary hover:bg-surface-highlight'}`}
          >
            <span className="material-icons-outlined">chat_bubble_outline</span>
            <span className="text-sm flex-1 text-left">Inbox</span>
            {conversations.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{conversations.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'calendar' ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'text-text-muted-dark hover:text-primary hover:bg-surface-highlight'}`}
          >
            <span className="material-icons-outlined">calendar_today</span>
            <span className="text-sm flex-1 text-left">Calendar</span>
          </button>
          <button onClick={() => onNavigate('settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-surface-highlight hover:text-primary transition-colors group">
            <span className="material-icons-outlined">add_link</span>
            <span className="font-medium text-sm text-left flex-1">Connect Platforms</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-border-light dark:border-border-dark space-y-2 mt-auto">
          <button onClick={() => onNavigate('settings')} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors text-left">
            <span className="material-icons-outlined text-lg">tune</span>
            <span className="text-sm">Settings</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:text-red-400 transition-colors text-left">
            <span className="material-icons-outlined text-lg transform rotate-180">logout</span>
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'messages' ? (
          <>
            {/* CONVERSATION LIST */}
            <aside className="w-[380px] flex-shrink-0 border-r border-border-light dark:border-border-dark flex flex-col bg-background-light dark:bg-[#141417]">
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                  <button onClick={loadData} className="p-2 text-text-muted-dark hover:text-primary transition-colors">
                    <span className="material-icons-outlined text-sm">refresh</span>
                  </button>
                </div>
                <div className="relative mb-4">
                  <span className="material-icons-outlined absolute left-3 top-2.5 text-text-muted-light dark:text-text-muted-dark text-sm">search</span>
                  <input 
                    className="w-full bg-surface-light dark:bg-surface-highlight border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Search conversations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-surface-dark/50 animate-pulse rounded-xl border border-border-dark"></div>)
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 px-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-6">
                      <span className="material-icons-outlined text-3xl text-primary/40">link_off</span>
                    </div>
                    <h3 className="text-sm font-bold mb-2">Start Orchestrating</h3>
                    <p className="text-xs text-text-muted-dark mb-8 leading-relaxed">Koppel je favoriete apps om te beginnen met chatten.</p>
                    
                    <div className="w-full space-y-2">
                      {PLATFORMS.filter(p => p.type !== 'google_calendar').map(p => (
                        <button 
                          key={p.type}
                          onClick={() => handleConnectPlatform(p.type)}
                          disabled={!!isConnecting}
                          className="w-full flex items-center justify-between p-3 bg-background-dark border border-border-dark rounded-xl hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-sm" style={{ color: p.color }}>{p.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{p.name}</span>
                          </div>
                          <span className="material-icons-outlined text-sm group-hover:translate-x-1 transition-transform">add</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  conversations.filter(c => c.contactName.toLowerCase().includes(searchQuery.toLowerCase())).map(conv => {
                    const platform = PLATFORMS.find(p => p.type === conv.platform);
                    const isSelected = selectedConvId === conv.id;
                    return (
                      <div 
                        key={conv.id} 
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-primary/30 bg-primary/5 dark:bg-surface-highlight shadow-gold-glow' : 'border-transparent hover:border-border-light dark:hover:border-border-dark bg-surface-light dark:bg-surface-dark'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={conv.contactAvatar} className="w-10 h-10 rounded-full border border-primary/20" alt="" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background-dark flex items-center justify-center p-0.5">
                              <span className="material-icons-outlined text-[10px]" style={{ color: platform?.color }}>{platform?.icon}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-sm truncate">{conv.contactName}</h3>
                              <span className="text-[9px] text-text-muted-dark">{conv.lastMessageTime}</span>
                            </div>
                            <p className="text-xs text-text-muted-dark truncate mt-0.5">{conv.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* CHAT AREA */}
            <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
              {selectedConversation ? (
                <>
                  <header className="h-20 px-8 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/50 dark:bg-surface-dark/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <img className="w-12 h-12 rounded-full border-2 border-primary/30" src={selectedConversation.contactAvatar} alt="" />
                      <div className="text-left">
                        <h2 className="text-lg font-bold">{selectedConversation.contactName}</h2>
                        <div className="flex items-center gap-1 text-[10px] text-text-muted-dark uppercase tracking-widest font-bold">
                          via <span className="text-primary">{selectedConversation.platform}</span>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden">
                    <section className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto scrollbar-hide">
                      {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">No messages in this thread</div>
                      ) : (
                        messages.map(m => (
                          <div key={m.id} className={`flex flex-col max-w-[75%] ${m.sender === 'user' ? 'items-end ml-auto text-right' : 'items-start text-left'}`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-primary text-background-dark font-medium rounded-tr-none shadow-gold-glow' : 'bg-surface-highlight text-white rounded-tl-none border border-border-dark'}`}>
                              {m.content}
                            </div>
                            <span className="text-[9px] text-text-muted-dark mt-1 px-2">{m.timestamp}</span>
                          </div>
                        ))
                      )}
                    </section>

                    {/* AI PANEL */}
                    <aside className="w-[320px] border-l border-border-dark bg-[#141417] p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">AI Suggestions</h3>
                        <span className="material-icons-outlined text-sm text-text-muted-dark">auto_awesome</span>
                      </div>
                      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
                        {isGenerating ? (
                          [1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-dark/50 animate-pulse rounded-xl border border-border-dark"></div>)
                        ) : suggestions.length > 0 ? (
                          suggestions.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => setMessageInput(s.text)}
                              className="w-full text-left p-4 rounded-xl border border-border-dark bg-surface-dark hover:border-primary/50 transition-all group"
                            >
                              <div className="flex items-center gap-2 mb-2 text-primary">
                                <span className="material-icons-outlined text-xs">chat_bubble</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest">{s.tone}</span>
                              </div>
                              <p className="text-xs text-text-muted-dark leading-relaxed group-hover:text-white transition-colors">{s.text}</p>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                             <span className="material-icons-outlined text-3xl opacity-10 mb-2">bolt</span>
                            <p className="text-[10px] text-text-muted-dark uppercase tracking-widest">Suggestions load here</p>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => fetchAISuggestions(messages)}
                        disabled={isGenerating || messages.length === 0}
                        className="mt-4 w-full py-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                      >
                        <span className={`material-icons-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>autorenew</span>
                        Regenerate
                      </button>
                    </aside>
                  </div>

                  <div className="p-6 border-t border-border-dark">
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-dark border border-border-dark rounded-2xl py-4 pl-6 pr-24 text-sm focus:border-primary outline-none" 
                        placeholder="Type message..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!messageInput.trim()}
                        className="absolute right-3 top-2.5 bg-primary text-background-dark px-5 py-2 rounded-xl text-xs font-bold shadow-gold-glow disabled:opacity-50"
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                  <span className="material-icons-outlined text-6xl mb-4">forum</span>
                  <p className="text-sm font-bold uppercase tracking-widest">Select conversation to begin</p>
                </div>
              )}
            </main>
          </>
        ) : (
          /* CALENDAR VIEW */
          <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark p-10 overflow-y-auto scrollbar-hide">
            <header className="mb-10 text-left">
              <h1 className="text-3xl font-bold">Upcoming Events</h1>
              <p className="text-text-muted-dark text-sm mt-1">Google Calendar integration via Unipile</p>
            </header>

            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-surface-dark/50 animate-pulse rounded-2xl border border-border-dark"></div>)}
               </div>
            ) : events.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-icons-outlined text-4xl text-primary">calendar_today</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No Calendar Connected</h3>
                <p className="text-text-muted-dark max-w-sm mb-8">Synchroniseer je Google Calendar om al je afspraken in dit overzicht te zien.</p>
                <button 
                  onClick={() => handleConnectPlatform('google_calendar')}
                  className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl shadow-gold-glow hover:bg-primary-hover transition-all"
                >
                  Connect Google Calendar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev, i) => (
                  <div key={i} className="bg-surface-dark border border-border-dark p-6 rounded-2xl hover:border-primary/50 transition-all text-left group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-icons-outlined text-primary text-xl">event</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted-dark bg-background-dark px-2 py-1 rounded border border-border-dark">
                        {ev.status || 'Confirmed'}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{ev.summary || 'Untitled Event'}</h4>
                    <p className="text-xs text-text-muted-dark mb-4">
                      {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : 'All day'}
                    </p>
                    <div className="pt-4 border-t border-border-dark flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase text-primary/60">Location: {ev.location || 'N/A'}</span>
                       <span className="material-icons-outlined text-sm text-text-muted-dark">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

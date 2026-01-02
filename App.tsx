
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Waitlist from './pages/Waitlist';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { UserProfile, LLMKey } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [llmKeys, setLlmKeys] = useState<LLMKey[]>([]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        // Check if there was a saved demo session
        const demoProfile = localStorage.getItem('orchestrated_demo_user');
        if (demoProfile) {
          const profile = JSON.parse(demoProfile);
          setUserProfile(profile);
          setCurrentPage('dashboard');
          applyTheme(profile);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else if (!localStorage.getItem('orchestrated_demo_user')) {
        setUserProfile(null);
        setCurrentPage('login');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !profile) {
      console.log('Profile not found, attempting to create for OAuth user...');
      // If profile doesn't exist (common for Google OAuth users), create it
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
          status: 'waitlist'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        setLoading(false);
        return;
      }
      
      setUserProfile(newProfile);
      setCurrentPage('waitlist');
    } else {
      setUserProfile(profile);
      fetchLLMKeys(authUser.id);
      if (profile.status === 'waitlist') {
        setCurrentPage('waitlist');
      } else {
        setCurrentPage('dashboard');
      }
      applyTheme(profile);
    }
    
    setLoading(false);
  };

  const fetchLLMKeys = async (userId: string) => {
    const { data, error } = await supabase
      .from('llm_keys')
      .select('*')
      .eq('user_id', userId);
    
    if (!error && data) {
      setLlmKeys(data.map(k => ({
        id: k.id,
        provider: k.provider,
        apiKey: k.api_key_encrypted, 
        isDefault: k.is_default,
        createdAt: k.created_at
      })));
    }
  };

  const applyTheme = (profile: UserProfile) => {
    if (profile.theme_mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    if (profile.theme_primary) {
      document.documentElement.style.setProperty('--primary', profile.theme_primary);
    }
  };

  const navigate = (page: string) => setCurrentPage(page);

  const handleLogout = async () => {
    localStorage.removeItem('orchestrated_demo_user');
    await supabase.auth.signOut();
    setUserProfile(null);
    setCurrentPage('login');
  };

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'demo-user-id',
      name: 'Alex Thorne (Demo)',
      email: 'alex@orchestrated.io',
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2y1_P_fm2A7PzoHmilj9Uv392a6GzxxpCbZbzAJwV1k31C44-KNpeHAg1LD2_YLE0G1V8th4x5tFG_wPUnLyrWeB7lubLISn0XspJzFL1vlxMXL3ScZ8ZVQ1R_rZtv0JrwkDCxamtts8vVbnET_HByOV9g1thYB1W_uid9rDuEiB45p26j0nNbSv3-NBvhsbjTT1w6cU-gBMxr81_f7jV94FA0ZG0bKU2zc2hdPlZeXzwDYT9pymTOKNOSsnhEQlMSdtpuFoK-mmu',
      status: 'active',
      theme_mode: 'dark',
      theme_primary: '#D4B483',
      theme_accent: '#64748B'
    };
    setUserProfile(demoUser);
    localStorage.setItem('orchestrated_demo_user', JSON.stringify(demoUser));
    applyTheme(demoUser);
    setCurrentPage('dashboard');
  };

  const addLLMKey = async (key: Omit<LLMKey, 'id' | 'createdAt'>) => {
    if (!userProfile || userProfile.id === 'demo-user-id') {
      const newKey: LLMKey = {
        ...key,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      setLlmKeys(prev => [...prev, newKey]);
      return;
    }
    
    const { data, error } = await supabase
      .from('llm_keys')
      .insert({
        user_id: userProfile.id,
        provider: key.provider,
        api_key_encrypted: key.apiKey,
        is_default: key.isDefault
      })
      .select()
      .single();

    if (!error && data) {
      fetchLLMKeys(userProfile.id);
    }
  };

  const removeLLMKey = async (id: string) => {
    if (userProfile?.id === 'demo-user-id') {
      setLlmKeys(prev => prev.filter(k => k.id !== id));
      return;
    }
    await supabase.from('llm_keys').delete().eq('id', id);
    if (userProfile) fetchLLMKeys(userProfile.id);
  };

  const setDefaultKey = async (id: string) => {
    if (!userProfile) return;
    if (userProfile.id === 'demo-user-id') {
      setLlmKeys(prev => prev.map(k => ({ ...k, isDefault: k.id === id })));
      return;
    }
    
    await supabase.from('llm_keys').update({ is_default: false }).eq('user_id', userProfile.id);
    await supabase.from('llm_keys').update({ is_default: true }).eq('id', id);
    fetchLLMKeys(userProfile.id);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    if (userProfile.id === 'demo-user-id') {
      const updated = { ...userProfile, ...updates };
      setUserProfile(updated);
      localStorage.setItem('orchestrated_demo_user', JSON.stringify(updated));
      applyTheme(updated);
      return;
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userProfile.id);

    if (!error) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      applyTheme(updatedProfile);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-dark text-primary">
        <span className="material-icons-outlined animate-spin text-4xl">autorenew</span>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={() => {}} onNavigate={navigate} onDemoLogin={handleDemoLogin} />;
      case 'signup':
        return <Signup onSignup={() => {}} onNavigate={navigate} />;
      case 'waitlist':
        return <Waitlist onLogout={handleLogout} />;
      case 'dashboard':
        return <Dashboard user={userProfile!} onNavigate={navigate} onLogout={handleLogout} llmKeys={llmKeys} />;
      case 'settings':
        return (
          <Settings 
            user={userProfile!} 
            onNavigate={navigate} 
            llmKeys={llmKeys} 
            onAddKey={addLLMKey} 
            onRemoveKey={removeLLMKey}
            onSetDefault={setDefaultKey}
            onUpdateUser={updateUserProfile}
            onLogout={handleLogout}
          />
        );
      default:
        return <Login onLogin={() => {}} onNavigate={navigate} onDemoLogin={handleDemoLogin} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
};

export default App;

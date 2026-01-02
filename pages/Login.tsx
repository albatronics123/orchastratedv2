
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (email: string) => void;
  onNavigate: (page: string) => void;
  onDemoLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, onDemoLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-dark font-sans">
      <div className="w-full max-w-md bg-surface-dark p-10 rounded-3xl shadow-2xl border border-border-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary tracking-tighter mb-2">Orchestrated</h1>
          <p className="text-text-muted-dark text-xs uppercase tracking-[0.3em] font-medium">Unified Messaging Dashboard</p>
        </div>

        <button 
          onClick={onDemoLogin}
          className="w-full bg-primary hover:bg-primary-hover text-background-dark font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-gold-glow mb-8 flex items-center justify-center gap-3 group"
        >
          <span className="material-icons-outlined group-hover:rotate-12 transition-transform">bolt</span>
          START DIRECT IN DEMO MODE
        </button>

        <div className="relative flex items-center justify-center mb-8">
          <hr className="w-full border-border-dark" />
          <span className="absolute px-4 bg-surface-dark text-[10px] text-text-muted-dark uppercase tracking-widest font-bold">Of Login</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:border-primary outline-none text-sm"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:border-primary outline-none text-sm"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-3 text-text-muted-dark text-xs font-bold hover:text-primary transition-colors">LOGIN MET EMAIL</button>
        </form>

        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-left">
          <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Status Report</p>
          <p className="text-[9px] text-text-muted-dark leading-relaxed">
            Google Auth 404 issue gedetecteerd. We stappen over naar **Vercel Hosting** voor de finale release. Gebruik voor nu de **Demo Mode** om de Unipile integratie te testen.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-text-muted-dark uppercase tracking-widest font-bold">
        Powered by Unipile & Gemini AI
      </p>
    </div>
  );
};

export default Login;

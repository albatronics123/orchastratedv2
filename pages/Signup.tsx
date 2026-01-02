
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignupProps {
  onSignup: (email: string) => void;
  onNavigate: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create profile entry
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        name: email.split('@')[0],
        email: email,
        security_phrase: phrase,
        status: 'waitlist'
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-dark">
      <div className="w-full max-w-md bg-surface-dark p-8 rounded-2xl shadow-2xl border border-border-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Join Orchestrated</h1>
          <p className="text-text-muted-dark">The future of unified communication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted-dark uppercase tracking-widest text-[10px]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted-dark uppercase tracking-widest text-[10px]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted-dark uppercase tracking-widest text-[10px]">Security Recovery Phrase</label>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="e.g. golden-eagle-soars-high"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
            <p className="text-[10px] text-primary/60 mt-2 uppercase tracking-wider font-bold">Important: Keep this phrase safe for account recovery.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-background-dark font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] mt-2 shadow-gold-glow disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted-dark">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-primary hover:underline font-bold">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;

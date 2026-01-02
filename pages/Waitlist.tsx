
import React from 'react';

interface WaitlistProps {
  onLogout: () => void;
}

const Waitlist: React.FC<WaitlistProps> = ({ onLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-lg bg-surface p-12 rounded-3xl border border-border text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
        
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-icons-outlined text-gold text-4xl">hourglass_empty</span>
        </div>

        <h1 className="text-3xl font-bold text-textMain mb-4">You're on the list!</h1>
        <p className="text-textMain/60 mb-10 max-w-sm mx-auto">
          We're onboarding users slowly to ensure the best experience. You'll receive an email as soon as we're ready for you.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-background/50 border border-border p-6 rounded-2xl">
            <span className="block text-textMain/40 text-xs uppercase tracking-widest mb-1">Queue Position</span>
            <span className="text-3xl font-bold text-gold">#1,248</span>
          </div>
          <div className="bg-background/50 border border-border p-6 rounded-2xl">
            <span className="block text-textMain/40 text-xs uppercase tracking-widest mb-1">Est. Wait Time</span>
            <span className="text-3xl font-bold text-gold">~2 weeks</span>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            disabled
            className="w-full bg-border text-textMain/40 font-medium py-3 rounded-xl cursor-not-allowed"
          >
            Notifications Active
          </button>
          <button 
            onClick={onLogout}
            className="w-full bg-transparent border border-border text-textMain/60 hover:text-textMain hover:border-gold/50 font-medium py-3 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;

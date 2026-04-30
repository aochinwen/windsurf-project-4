import { useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { supabase, isCloudEnabled } from '../lib/supabase';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cloudOn = isCloudEnabled();

  useEffect(() => {
    if (!cloudOn) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, [cloudOn]);

  // If cloud isn't configured, fall back to local-only mode (current app behavior).
  if (!cloudOn) {
    return children({ user: null, signOut: null, cloudEnabled: false });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#181a27', color: '#cbd5e1' }}>
        Loading…
      </div>
    );
  }

  if (session?.user) {
    return children({
      user: session.user,
      signOut: () => supabase.auth.signOut(),
      cloudEnabled: true,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setInfo('Check your email to confirm your account, then sign in.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center px-4" style={{ background: '#181a27' }}>
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ background: '#1e2030', borderColor: '#2a2d3e' }}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <User size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">EML Editor</h1>
            <p className="text-[11px]" style={{ color: '#9ca3af' }}>
              {mode === 'signin' ? 'Sign in to sync sessions' : 'Create an account to sync sessions'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ background: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ background: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
          />
          {error && <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>}
          {info && <p className="text-xs" style={{ color: '#86efac' }}>{info}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: '#4f46e5', color: '#fff' }}
          >
            {submitting ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
          className="mt-4 w-full text-center text-xs"
          style={{ color: '#9ca3af' }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

export function SignOutButton({ user, onSignOut }) {
  if (!user || !onSignOut) return null;
  return (
    <button
      onClick={onSignOut}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors"
      style={{ border: '1px solid #3d4060', color: '#cbd5e1', background: 'transparent' }}
      title={`Sign out ${user.email}`}
    >
      <LogOut size={12} /> Sign out
    </button>
  );
}

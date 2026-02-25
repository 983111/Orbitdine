import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveAuthSession } from '@/lib/sessionAuth';

export default function AuthLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const role = idTokenResult.claims.role;

      if (role !== 'manager' && role !== 'owner') {
        throw new Error('Your account is missing a valid staff role claim.');
      }

      saveAuthSession(idTokenResult.token, {
        id: userCredential.user.uid,
        username: userCredential.user.email ?? username,
        role,
      });

      const fallbackPath = role === 'owner' ? '/owner' : '/manager/dashboard';
      navigate((location.state as any)?.from ?? fallbackPath, { replace: true });
    } catch {
      setError('Failed to login with Firebase. Check your email, password, and role claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#243b7a_0%,transparent_45%),radial-gradient(circle_at_80%_0%,#5b2a7a_0%,transparent_40%),linear-gradient(180deg,#070b18_0%,#0d1020_100%)] px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <section className="text-white md:pr-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            OrbitDine Operations
          </p>
          <h1 className="mb-4 text-4xl font-semibold leading-tight">Securely access the manager and owner console.</h1>
          <p className="max-w-md text-sm text-slate-300">
            Monitor tables, control kitchen flow, and manage settings in one place. Sign in with your Firebase staff account to continue.
          </p>
        </section>

        <form
          onSubmit={onSubmit}
          className="w-full rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Staff Login</h2>
            <p className="mt-1 text-sm text-slate-600">Only authorized managers and owners can access this section.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="name@company.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Looking for guest ordering? <Link to="/table/1" className="font-medium text-blue-600 hover:text-blue-700">Open customer menu</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

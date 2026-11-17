import { FormEvent, useState } from 'react';
import { Fingerprint, LockKeyhole, Sparkles } from 'lucide-react';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response =
        mode === 'register'
          ? await authApi.register(email, displayName)
          : await authApi.login(email);
      setUser(response.user);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo completar la autenticación.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl sm:p-9">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Vocab<span className="text-emerald-600">App</span></h1>
          <p className="mt-2 text-slate-600">Aprende inglés de forma visual y conserva tu progreso.</p>
        </div>

        {!window.isSecureContext && (
          <div role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            Las Passkeys requieren HTTPS. Abre esta aplicación desde su dirección segura de Tailscale.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Modo de acceso">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => { setMode(item); setError(''); }}
              className={`min-h-touch rounded-lg px-3 py-2 font-bold ${mode === item ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
            >
              {item === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block text-sm font-bold text-slate-700">
              Tu nombre
              <input
                required
                minLength={2}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                className="mt-1 min-h-touch w-full rounded-xl border border-slate-300 px-4 focus:border-emerald-600"
              />
            </label>
          )}
          <label className="block text-sm font-bold text-slate-700">
            Correo electrónico
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username webauthn"
              className="mt-1 min-h-touch w-full rounded-xl border border-slate-300 px-4 focus:border-emerald-600"
            />
          </label>
          {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{error}</p>}
          <button
            disabled={submitting || !window.isSecureContext}
            className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
            {submitting ? 'Esperando al dispositivo…' : mode === 'login' ? 'Entrar con Passkey' : 'Crear mi Passkey'}
          </button>
        </form>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" /> Sin contraseñas. Tu clave privada nunca sale de tu dispositivo.
        </p>
      </section>
    </main>
  );
}

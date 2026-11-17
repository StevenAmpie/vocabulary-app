import { FormEvent, useState } from 'react';
import { Fingerprint, LockKeyhole } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
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
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-4 py-12 text-stone-900">
      <section className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_2px_4px_rgba(28,25,23,0.04),0_24px_60px_-28px_rgba(28,25,23,0.2)] sm:p-9">
        <div className="text-center">
          <BrandMark className="mx-auto h-14 w-14" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Tu espacio de aprendizaje</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">Vocab<span className="text-emerald-800">App</span></h1>
          <p className="mt-2 text-stone-600">Aprende inglés de forma visual y conserva tu progreso.</p>
        </div>

        {!window.isSecureContext && (
          <div role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            Las Passkeys requieren HTTPS. Abre esta aplicación desde su dirección segura de Tailscale.
          </div>
        )}

        <div className="mt-7 grid grid-cols-2 rounded-2xl bg-stone-100 p-1" role="group" aria-label="Modo de acceso">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => { setMode(item); setError(''); }}
              className={`min-h-touch rounded-xl px-3 py-2 font-bold transition-colors duration-150 active:scale-[0.98] ${mode === item ? 'bg-white text-emerald-900 shadow-[0_1px_3px_rgba(28,25,23,0.08)]' : 'text-stone-700 hover:bg-white/60'}`}
            >
              {item === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block text-sm font-bold text-stone-800">
              Tu nombre
              <input
                required
                minLength={2}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                className="mt-2 min-h-touch w-full rounded-xl border border-stone-300 bg-stone-50 px-4 text-base text-stone-900 transition-colors hover:border-stone-400 focus:border-emerald-700 focus:bg-white"
              />
            </label>
          )}
          <label className="block text-sm font-bold text-stone-800">
            Correo electrónico
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username webauthn"
              className="mt-2 min-h-touch w-full rounded-xl border border-stone-300 bg-stone-50 px-4 text-base text-stone-900 transition-colors hover:border-stone-400 focus:border-emerald-700 focus:bg-white"
            />
          </label>
          {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{error}</p>}
          <button
            disabled={submitting || !window.isSecureContext}
            className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 font-bold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
          >
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
            {submitting ? 'Esperando al dispositivo…' : mode === 'login' ? 'Entrar con Passkey' : 'Crear mi Passkey'}
          </button>
        </form>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-stone-600">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" /> Sin contraseñas. Tu clave privada nunca sale de tu dispositivo.
        </p>
      </section>
    </main>
  );
}

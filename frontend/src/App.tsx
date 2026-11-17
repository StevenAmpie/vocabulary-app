import { BookOpen, LogOut, Sparkles } from 'lucide-react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AlmanacPage } from './features/almanac/AlmanacPage';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthPage } from './features/auth/AuthPage';
import { StudySessionPage } from './features/learning/StudySessionPage';
import { DashboardPage } from './pages/DashboardPage';

function AuthenticatedApp() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div role="status" className="flex min-h-screen items-center justify-center bg-slate-50 font-bold text-slate-600">Recuperando tu sesión…</div>;
  }
  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <a href="#main-content" className="fixed left-4 top-2 z-[100] -translate-y-20 rounded-lg bg-slate-950 px-4 py-2 font-bold text-white transition-transform focus:translate-y-0">Ir al contenido principal</a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
            Vocab<span className="text-emerald-600">App</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Navegación principal">
            <Link to="/almanac" className="inline-flex min-h-touch items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100">
              <BookOpen className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Almanaque</span>
            </Link>
            <span className="hidden text-sm text-slate-500 md:inline">Hola, {user.displayName}</span>
            <button type="button" onClick={() => void logout()} className="inline-flex min-h-touch items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/almanac" element={<AlmanacPage />} />
          <Route path="/learn/:categorySlug?" element={<StudySessionPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}

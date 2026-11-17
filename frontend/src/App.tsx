import { BookOpen, LogOut } from 'lucide-react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AlmanacPage } from './features/almanac/AlmanacPage';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthPage } from './features/auth/AuthPage';
import { StudySessionPage } from './features/learning/StudySessionPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrandMark } from './components/BrandMark';

function AuthenticatedApp() {
  const { user, loading, logout } = useAuth();
  const isStudying = useLocation().pathname.startsWith('/learn');

  if (loading) {
    return <div role="status" className="flex min-h-screen items-center justify-center bg-stone-50 font-bold text-stone-600">Recuperando tu sesión…</div>;
  }
  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5ef] text-stone-900">
      <a href="#main-content" className="fixed left-4 top-2 z-[100] -translate-y-20 rounded-lg bg-stone-950 px-4 py-2 font-bold text-white transition-transform focus:translate-y-0">Ir al contenido principal</a>
      {!isStudying && <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-stone-900">
            <BrandMark />
            Vocab<span className="text-emerald-800">App</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Navegación principal">
            <Link to="/almanac" className="inline-flex min-h-touch items-center gap-2 rounded-xl px-3 text-sm font-bold text-stone-700 transition-colors hover:bg-white hover:text-emerald-800">
              <BookOpen className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Almanaque</span>
            </Link>
            <span className="hidden text-sm text-stone-600 md:inline">Hola, {user.displayName}</span>
            <button type="button" onClick={() => void logout()} className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl text-stone-700 transition-colors hover:bg-white hover:text-emerald-800" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>}
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
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

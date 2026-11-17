import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlmanacCard } from '../../components/AlmanacCard';
import { AlmanacCategory, AlmanacListResponse, AlmanacWordDetail, AlmanacWordItem, WordState } from '../../types';
import { almanacApi } from './almanacApi';
import { WordDetailDialog } from './WordDetailDialog';

export function AlmanacPage() {
  const [result, setResult] = useState<AlmanacListResponse | null>(null);
  const [categories, setCategories] = useState<AlmanacCategory[]>([]);
  const [state, setState] = useState<WordState | ''>('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AlmanacWordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void almanacApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      void almanacApi
        .list({ state: state || undefined, category: category || undefined, search: search || undefined, page, limit: 12 })
        .then(setResult)
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'No se pudo cargar el almanaque.'))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [category, page, search, state]);

  async function selectWord(word: AlmanacWordItem) {
    try {
      setSelected(await almanacApi.detail(word.id));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo abrir la ficha.');
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4 border-b border-stone-200 pb-7">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-white"><BookOpen className="h-6 w-6" aria-hidden="true" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Tu biblioteca personal</p><h1 className="mt-1 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">El almanaque</h1><p className="mt-2 text-stone-600">Cada palabra que descubres encuentra aquí su lugar.</p></div>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-emerald-950 p-5 text-white"><strong className="font-mono text-3xl tabular-nums">{result.meta.totalWords}</strong><br /><span className="text-sm text-emerald-100">Coleccionadas</span></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5"><strong className="font-mono text-3xl tabular-nums text-stone-900">{result.meta.discoveredCount}</strong><br /><span className="text-sm text-stone-600">Descubiertas</span></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5"><strong className="font-mono text-3xl tabular-nums text-stone-900">{result.meta.consolidatingCount}</strong><br /><span className="text-sm text-stone-600">Consolidando</span></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5"><strong className="font-mono text-3xl tabular-nums text-emerald-800">{result.meta.masteredCount}</strong><br /><span className="text-sm text-stone-600">Dominadas</span></div>
        </div>
      )}

      <div className="grid gap-3 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)] md:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <span className="sr-only">Buscar palabras</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-stone-500" aria-hidden="true" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar palabra…" className="min-h-touch w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3 text-base text-stone-900 focus:border-emerald-700" />
        </label>
        <select value={state} onChange={(event) => { setState(event.target.value as WordState | ''); setPage(1); }} className="min-h-touch rounded-xl border border-stone-300 bg-stone-50 px-3 text-base text-stone-900 focus:border-emerald-700" aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="DISCOVERED">Descubiertas</option>
          <option value="CONSOLIDATING">En consolidación</option>
          <option value="MASTERED">Dominadas</option>
        </select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="min-h-touch rounded-xl border border-stone-300 bg-stone-50 px-3 text-base text-stone-900 focus:border-emerald-700" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name} ({item.collectedCount})</option>)}
        </select>
      </div>

      {error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-950">{error}</p>}
      {loading ? (
        <div role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-stone-200/70" />)}<span className="sr-only">Cargando tu colección…</span></div>
      ) : result?.data.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.data.map((word) => <AlmanacCard key={word.id} item={word} onSelect={selectWord} />)}</div>
      ) : (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-700"><BookOpen className="mx-auto h-10 w-10 text-emerald-800" aria-hidden="true" /><p className="mt-3 font-semibold">Aún no hay palabras con estos filtros.</p><p className="mt-1 text-sm">Prueba otra búsqueda o comienza una sesión para ampliar tu colección.</p><Link to="/" className="mt-4 inline-flex min-h-touch items-center gap-2 font-bold text-emerald-800 hover:underline">Ir al inicio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      )}

      {result && result.meta.totalPages > 1 && (
        <nav aria-label="Paginación del almanaque" className="flex justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="min-h-touch rounded-xl border border-stone-300 bg-white px-4 font-semibold text-stone-800 disabled:opacity-40">Anterior</button>
          <span className="flex items-center text-sm font-medium text-stone-600">Página {page} de {result.meta.totalPages}</span>
          <button disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="min-h-touch rounded-xl border border-stone-300 bg-white px-4 font-semibold text-stone-800 disabled:opacity-40">Siguiente</button>
        </nav>
      )}
      {selected && <WordDetailDialog word={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

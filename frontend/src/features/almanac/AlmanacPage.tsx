import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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
      <div>
        <h1 className="text-3xl font-black text-slate-900">📖 El Almanaque</h1>
        <p className="text-slate-600">Tu colección real de palabras y su progreso de maestría.</p>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm"><strong className="text-2xl">{result.meta.totalWords}</strong><br /><span className="text-sm text-slate-500">Coleccionadas</span></div>
          <div className="rounded-2xl bg-blue-50 p-4"><strong className="text-2xl">{result.meta.discoveredCount}</strong><br /><span className="text-sm">Descubiertas</span></div>
          <div className="rounded-2xl bg-amber-50 p-4"><strong className="text-2xl">{result.meta.consolidatingCount}</strong><br /><span className="text-sm">Consolidando</span></div>
          <div className="rounded-2xl bg-emerald-50 p-4"><strong className="text-2xl">{result.meta.masteredCount}</strong><br /><span className="text-sm">Dominadas</span></div>
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <span className="sr-only">Buscar palabras</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden="true" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar palabra…" className="min-h-touch w-full rounded-xl border border-slate-300 pl-10 pr-3" />
        </label>
        <select value={state} onChange={(event) => { setState(event.target.value as WordState | ''); setPage(1); }} className="min-h-touch rounded-xl border border-slate-300 px-3" aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="DISCOVERED">Descubiertas</option>
          <option value="CONSOLIDATING">En consolidación</option>
          <option value="MASTERED">Dominadas</option>
        </select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="min-h-touch rounded-xl border border-slate-300 px-3" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.iconUrl} {item.name} ({item.collectedCount})</option>)}
        </select>
      </div>

      {error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-950">{error}</p>}
      {loading ? (
        <p role="status" className="rounded-2xl bg-white p-8 text-center">Cargando tu colección…</p>
      ) : result?.data.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.data.map((word) => <AlmanacCard key={word.id} item={word} onSelect={selectWord} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Aún no hay palabras con estos filtros. Completa una sesión para ampliar tu colección.</div>
      )}

      {result && result.meta.totalPages > 1 && (
        <nav aria-label="Paginación del almanaque" className="flex justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="min-h-touch rounded-xl border px-4 disabled:opacity-40">Anterior</button>
          <span className="flex items-center">Página {page} de {result.meta.totalPages}</span>
          <button disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="min-h-touch rounded-xl border px-4 disabled:opacity-40">Siguiente</button>
        </nav>
      )}
      {selected && <WordDetailDialog word={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

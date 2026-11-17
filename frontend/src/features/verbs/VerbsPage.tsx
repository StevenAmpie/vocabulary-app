import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search, Volume2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AudioPlayerButton } from '../../components/AudioPlayerButton';
import { VerbItem } from '../../types';
import { verbsApi } from './verbsApi';

export function VerbsPage() {
  const { slug } = useParams();
  const [verbs, setVerbs] = useState<VerbItem[]>([]);
  const [search, setSearch] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void verbsApi.list().then(setVerbs).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los verbos.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => setImageIndex(0), [slug]);

  const selected = verbs.find((verb) => verb.slug === slug);
  const filtered = useMemo(() => verbs.filter((verb) => `${verb.termEn} ${verb.translationEs}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())), [verbs, search]);

  if (slug && selected) {
    const images = selected.imageUrls.length ? selected.imageUrls : [];
    const activeIndex = Math.min(imageIndex, Math.max(0, images.length - 1));
    const credit = selected.imageCredits?.find((item) => item.src === images[activeIndex]) ?? selected.imageCredits?.[activeIndex];
    return <section className="mx-auto max-w-4xl pb-16">
      <Link to="/verbs" className="inline-flex min-h-touch items-center gap-2 text-sm font-bold text-stone-700 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos los verbos</Link>
      <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_12px_40px_-24px_rgba(28,25,23,0.3)]">
        <div className="relative bg-stone-100">
          {images.length ? <img src={images[activeIndex]} alt={`Representación ${activeIndex + 1} de la acción ${selected.translationEs}`} className="aspect-[4/3] max-h-[440px] w-full object-cover sm:aspect-[16/9]" /> : <div className="flex aspect-[4/3] items-center justify-center text-stone-600">Imagen no disponible</div>}
          {images.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setImageIndex((activeIndex - 1 + images.length) % images.length)} aria-label="Imagen anterior" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-stone-900 shadow-sm active:scale-95"><ChevronLeft aria-hidden="true" /></button>
            <span className="rounded-full bg-stone-950/85 px-3 py-1 font-mono text-xs tabular-nums text-white" aria-live="polite">{activeIndex + 1} / {images.length}</span>
            <button type="button" onClick={() => setImageIndex((activeIndex + 1) % images.length)} aria-label="Imagen siguiente" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-stone-900 shadow-sm active:scale-95"><ChevronRight aria-hidden="true" /></button>
          </div>}
        </div>
        <div className="p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Verbo en acción</p>
          <div className="mt-2 flex items-start justify-between gap-4"><div><h1 lang="en" className="font-serif text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">{selected.termEn}</h1><p className="mt-1 font-mono text-sm text-stone-600">{selected.phoneticIpa}</p><p className="mt-3 text-lg font-semibold text-emerald-900">{selected.translationEs}</p></div><AudioPlayerButton audioUrl={selected.audioUrl} fallbackText={selected.termEn} label={`Escuchar pronunciación de ${selected.termEn}`} /></div>
          {selected.exampleEn && <div className="mt-7 rounded-2xl bg-[#f7f5ef] p-5"><p lang="en" className="text-lg font-medium text-stone-900">{selected.exampleEn}</p>{selected.exampleEs && <p className="mt-1 text-sm text-stone-600">{selected.exampleEs}</p>}</div>}
          {credit?.creditUrl && <p className="mt-4 text-xs text-stone-600">Imagen: <a href={credit.creditUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">{credit.creator || 'Ver autoría'}</a>{credit.license ? ` · ${credit.license}` : ''}</p>}
          <Link to={`/learn/verbs?wordId=${selected.id}`} className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-center font-bold text-white hover:bg-emerald-900 active:scale-[0.98]">Practicar este verbo <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>;
  }

  return <section className="space-y-7 pb-16">
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-stone-200 pb-7"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Acciones cotidianas</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Verbos en acción</h1><p className="mt-3 max-w-xl text-stone-600">Aprende verbos frecuentes con escenas reales, pronunciación y práctica visual.</p></div><Link to="/learn/verbs" className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900">Practicar verbos <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    <label className="relative block max-w-lg"><span className="sr-only">Buscar verbo</span><Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-500" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en inglés o español" className="min-h-[52px] w-full rounded-xl border border-stone-300 bg-white pl-12 pr-4 text-base text-stone-900" /></label>
    {error && <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">{error}<button type="button" onClick={() => window.location.reload()} className="ml-3 min-h-touch font-bold underline">Reintentar</button></div>}
    {loading ? <div role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-stone-200" />)}<span className="sr-only">Cargando verbos</span></div> : filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((verb) => <Link key={verb.id} to={`/verbs/${verb.slug}`} className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all hover:-translate-y-1 hover:border-emerald-300 active:scale-[0.99]"><div className="overflow-hidden rounded-[1rem] bg-stone-100">{verb.imageUrls[0] ? <img src={verb.imageUrls[0]} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-[1.03]" /> : <div className="aspect-[16/10]" />}</div><div className="flex items-start justify-between gap-3 p-3"><div><h2 lang="en" className="text-xl font-bold text-stone-900">{verb.termEn}</h2><p className="font-mono text-xs text-stone-600">{verb.phoneticIpa}</p><p className="mt-2 text-sm text-emerald-900">{verb.translationEs}</p></div><Volume2 className="h-5 w-5 text-emerald-800" aria-hidden="true" /></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-700">No encontramos verbos con esa búsqueda.</div>}
    {!loading && <p className="text-sm text-stone-600" aria-live="polite">{filtered.length} verbos</p>}
  </section>;
}

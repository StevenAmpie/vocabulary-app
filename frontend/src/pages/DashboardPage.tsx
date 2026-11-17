import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Briefcase, Check, Laptop2, Leaf, Play, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlmanacCard } from '../components/AlmanacCard';
import { AlmanacWordDetail, AlmanacWordItem } from '../types';
import { almanacApi } from '../features/almanac/almanacApi';
import { WordDetailDialog } from '../features/almanac/WordDetailDialog';

const categories = [
  { slug: 'technology', label: 'Tecnología', description: 'Palabras para tu mundo digital', icon: Laptop2, href: '/learn/technology' },
  { slug: 'office', label: 'Oficina', description: 'Objetos que usas a diario', icon: Briefcase, href: '/learn/office' },
  { slug: 'fruits', label: 'Frutas', description: 'Aprende con formas y colores', icon: Leaf, href: '/learn/fruits' },
  { slug: 'verbs', label: 'Verbos', description: '50 acciones en imágenes reales', icon: Zap, href: '/verbs' },
];

export function DashboardPage() {
  const [words, setWords] = useState<AlmanacWordItem[]>([]);
  const [selected, setSelected] = useState<AlmanacWordDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void almanacApi.list({ limit: 3 }).then((result) => setWords(result.data)).catch(() => setWords([])).finally(() => setLoading(false));
  }, []);

  async function openWord(word: AlmanacWordItem) {
    setSelected(await almanacApi.detail(word.id));
  }

  return (
    <section className="space-y-12 pb-12">
      <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-950 p-7 text-stone-50 shadow-[0_20px_55px_-30px_rgba(6,95,70,0.7)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full border border-white/10" aria-hidden="true" />
          <span className="relative inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200"><BookOpen className="h-4 w-4" /> Tu espacio de aprendizaje</span>
          <h1 className="relative mt-7 max-w-xl font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Cada palabra abre una nueva idea.</h1>
          <p className="relative mt-5 max-w-lg text-base leading-relaxed text-emerald-100">Observa, escucha y descubre vocabulario en sesiones breves que puedes retomar cuando quieras.</p>
          <Link to="/learn/technology" className="relative mt-8 inline-flex min-h-touch items-center gap-3 rounded-xl bg-stone-50 px-5 py-3 font-bold text-emerald-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:scale-[0.98]">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Empezar a practicar <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-18px_rgba(28,25,23,0.18)] sm:p-8">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Check className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">A tu ritmo</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">Aprender también es volver a mirar.</h2>
            <p className="mt-3 leading-relaxed text-stone-600">Tus palabras descubiertas quedan en el almanaque para repasarlas cuando las necesites.</p>
          </div>
          <Link to="/almanac" className="mt-8 inline-flex min-h-touch items-center gap-2 font-bold text-emerald-800 hover:text-emerald-950 hover:underline hover:underline-offset-4">Explorar almanaque <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>

      <div>
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Elige un camino</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Sesiones por categoría</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return <Link key={category.slug} to={category.href} className="group flex min-h-[180px] flex-col rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_12px_30px_-18px_rgba(6,95,70,0.35)] active:scale-[0.99] sm:min-h-[210px] sm:p-6">
              <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-emerald-900 group-hover:bg-emerald-50"><Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" /></span><span className="font-mono text-xs tabular-nums text-stone-400">0{index + 1}</span></div>
              <h3 className="mt-7 text-xl font-bold tracking-tight text-stone-900">{category.label}</h3><p className="mt-1 text-sm text-stone-600">{category.description}</p>
              <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-emerald-800">{category.slug === 'verbs' ? 'Explorar verbos' : 'Iniciar sesión'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>;
          })}
        </div>
      </div>

      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Tu recorrido</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Colección reciente</h2></div><Link to="/almanac" className="inline-flex min-h-touch items-center gap-2 font-bold text-emerald-800 hover:underline hover:underline-offset-4">Ver todas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        {loading ? <div role="status" className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-stone-200/70" />)}</div> : words.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{words.map((word) => <AlmanacCard key={word.id} item={word} onSelect={openWord} />)}</div> : <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center"><BookOpen className="mx-auto h-9 w-9 text-emerald-700" aria-hidden="true" /><p className="mt-3 font-semibold text-stone-800">Tu colección empieza con una palabra.</p><Link to="/learn/technology" className="mt-3 inline-flex min-h-touch items-center font-bold text-emerald-800 hover:underline">Comenzar una sesión</Link></div>}
      </div>
      {selected && <WordDetailDialog word={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

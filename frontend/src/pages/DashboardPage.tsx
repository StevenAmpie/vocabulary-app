import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlmanacCard } from '../components/AlmanacCard';
import { AlmanacWordDetail, AlmanacWordItem } from '../types';
import { almanacApi } from '../features/almanac/almanacApi';
import { WordDetailDialog } from '../features/almanac/WordDetailDialog';

const categories = [
  { slug: 'technology', label: 'Tecnología', icon: '💻', color: 'from-emerald-500 to-teal-600' },
  { slug: 'office', label: 'Oficina', icon: '🏢', color: 'from-blue-500 to-indigo-600' },
  { slug: 'fruits', label: 'Frutas', icon: '🍎', color: 'from-orange-500 to-rose-500' },
];

export function DashboardPage() {
  const [words, setWords] = useState<AlmanacWordItem[]>([]);
  const [selected, setSelected] = useState<AlmanacWordDetail | null>(null);

  useEffect(() => {
    void almanacApi.list({ limit: 3 }).then((result) => setWords(result.data)).catch(() => setWords([]));
  }, []);

  async function openWord(word: AlmanacWordItem) {
    setSelected(await almanacApi.detail(word.id));
  }

  return (
    <section className="space-y-9">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">Aprendizaje visual inductivo</span>
        <h1 className="mt-4 max-w-3xl text-3xl font-black md:text-4xl">Descubre palabras, escucha su pronunciación y construye tu almanaque.</h1>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">Elige una categoría</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.slug} to={`/learn/${category.slug}`} className={`rounded-2xl bg-gradient-to-br ${category.color} p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
              <span className="text-4xl" aria-hidden="true">{category.icon}</span>
              <h3 className="mt-4 text-xl font-black">{category.label}</h3>
              <p className="mt-1 text-sm text-white/80">Iniciar sesión de 4 palabras</p>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-black text-slate-900">Tu colección reciente</h2><p className="text-sm text-slate-500">El progreso se guarda automáticamente.</p></div>
          <Link to="/almanac" className="font-bold text-emerald-700 hover:underline">Ver almanaque</Link>
        </div>
        {words.length ? <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{words.map((word) => <AlmanacCard key={word.id} item={word} onSelect={openWord} />)}</div> : <p className="mt-4 rounded-2xl border border-dashed bg-white p-8 text-center text-slate-600">Completa tu primera sesión para comenzar la colección.</p>}
      </div>
      {selected && <WordDetailDialog word={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

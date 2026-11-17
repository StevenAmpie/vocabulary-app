import { ArrowUpRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { AlmanacWordItem } from '../types';

interface AlmanacCardProps {
  item: AlmanacWordItem;
  onSelect: (item: AlmanacWordItem) => void;
}

export function AlmanacCard({ item, onSelect }: AlmanacCardProps) {
  const stateBadge = {
    DISCOVERED: { label: 'Descubierta', icon: BookOpen, color: 'bg-stone-100 text-stone-700' },
    CONSOLIDATING: { label: 'Consolidando', icon: Sparkles, color: 'bg-amber-50 text-amber-900' },
    MASTERED: { label: 'Dominada', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-900' },
  }[item.state];
  const BadgeIcon = stateBadge.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-haspopup="dialog"
      aria-label={`Ver ficha de ${item.termEn}, estado: ${stateBadge.label}`}
      className="group flex w-full min-h-[280px] flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-3 text-left shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-22px_rgba(28,25,23,0.2)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_12px_32px_-18px_rgba(6,95,70,0.25)] active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.9rem] bg-stone-100">
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        <span className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${stateBadge.color}`}><BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />{stateBadge.label}</span>
      </div>
      <div className="flex w-full flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-2"><div><h3 lang="en" className="text-xl font-bold tracking-tight text-stone-900">{item.termEn}</h3><p className="mt-0.5 font-mono text-xs text-stone-600">{item.phoneticIpa}</p></div><ArrowUpRight className="h-5 w-5 text-emerald-800 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></div>
        <p className="mt-2 text-sm text-stone-700">{item.translationEs}</p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600"><span>Maestría</span><span className="font-mono tabular-nums text-emerald-800">{item.masteryPercentage}%</span></div>
      </div>
    </button>
  );
}

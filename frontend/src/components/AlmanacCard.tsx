import React from 'react';
import { Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { AlmanacWordItem } from '../types';

interface AlmanacCardProps {
  item: AlmanacWordItem;
  onSelect: (item: AlmanacWordItem) => void;
}

export const AlmanacCard: React.FC<AlmanacCardProps> = ({ item, onSelect }) => {
  const stateBadge = {
    DISCOVERED: {
      label: 'Descubierta',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: BookOpen,
    },
    CONSOLIDATING: {
      label: 'En Consolidación',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Sparkles,
    },
    MASTERED: {
      label: 'Dominada',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
    },
  }[item.state];

  const BadgeIcon = stateBadge.icon;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-haspopup="dialog"
      aria-label={`Ver ficha de ${item.termEn}, estado: ${stateBadge.label}`}
      className="group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md 
        transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between 
        focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none min-h-[220px]"
    >
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img
          src={item.imageUrl}
          alt={`Representación de ${item.termEn}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stateBadge.color}`}
          >
            <BadgeIcon className="w-3 h-3" aria-hidden="true" />
            {stateBadge.label}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {item.termEn}
        </h3>
        <p className="text-sm text-slate-500 font-mono">{item.phoneticIpa}</p>
        <p className="text-sm font-medium text-slate-700 mt-1">{item.translationEs}</p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Maestría: {item.masteryPercentage}%</span>
        <span className="font-semibold text-blue-600 group-hover:underline">Ver ficha ➔</span>
      </div>
    </article>
  );
};

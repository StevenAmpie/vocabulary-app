import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AudioPlayerButton } from '../../components/AudioPlayerButton';
import { AlmanacWordDetail } from '../../types';

export function WordDetailDialog({ word, onClose }: { word: AlmanacWordDetail; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="word-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} aria-label="Cerrar ficha" className="min-h-touch min-w-touch rounded-full p-2 hover:bg-slate-100">
            <X aria-hidden="true" />
          </button>
        </div>
        <img src={word.imageUrl} alt={`Representación de ${word.termEn}`} className="aspect-video w-full rounded-2xl bg-slate-100 object-cover" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="word-detail-title" className="text-3xl font-black text-slate-900" lang="en">{word.termEn}</h2>
            <p className="font-mono text-slate-500">{word.phoneticIpa}</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{word.translationEs}</p>
          </div>
          <AudioPlayerButton audioUrl={word.audioUrl} fallbackText={word.termEn} size="lg" />
        </div>
        {word.contextSentence && (
          <blockquote className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p lang="en">“{word.contextSentence.sentenceEn}”</p>
            <p className="mt-1 text-sm text-slate-500">{word.contextSentence.translationEs}</p>
          </blockquote>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 p-3"><strong>{word.masteryPercentage}%</strong><br />Maestría</div>
          <div className="rounded-xl border border-slate-200 p-3"><strong>{word.progress.directSuccessCount}</strong><br />Aciertos directos</div>
        </div>
        <Link
          to={`/learn/${word.categorySlug}?wordId=${word.id}`}
          onClick={onClose}
          className="mt-6 inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700"
        >
          Volver a jugar
        </Link>
      </div>
    </div>
  );
}

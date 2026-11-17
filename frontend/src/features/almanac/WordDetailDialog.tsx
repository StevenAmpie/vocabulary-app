import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AudioPlayerButton } from '../../components/AudioPlayerButton';
import { AlmanacWordDetail } from '../../types';

export function WordDetailDialog({ word, onClose }: { word: AlmanacWordDetail; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="word-detail-title" className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/70 p-0 sm:items-center sm:p-4">
      <div ref={dialogRef} className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:max-h-[92vh] sm:rounded-[2rem] sm:p-7">
        <div className="flex justify-end">
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar ficha" className="flex min-h-touch min-w-touch items-center justify-center rounded-xl text-stone-700 transition-colors hover:bg-stone-100 active:scale-95">
            <X aria-hidden="true" />
          </button>
        </div>
        <img src={word.imageUrl} alt={`Representación de ${word.termEn}`} className="aspect-[16/10] w-full rounded-2xl bg-stone-100 object-cover" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="word-detail-title" className="break-words text-3xl font-black tracking-tight text-stone-900" lang="en">{word.termEn}</h2>
            <p className="font-mono text-sm text-stone-600">{word.phoneticIpa}</p>
            <p className="mt-1 text-lg font-bold text-emerald-800">{word.translationEs}</p>
          </div>
          <AudioPlayerButton audioUrl={word.audioUrl} fallbackText={word.termEn} size="lg" />
        </div>
        {word.contextSentence && (
          <blockquote className="mt-5 rounded-2xl bg-stone-50 p-4 text-stone-800">
            <p lang="en">“{word.contextSentence.sentenceEn}”</p>
            <p className="mt-1 text-sm text-stone-600">{word.contextSentence.translationEs}</p>
          </blockquote>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-stone-200 p-3 text-stone-700"><strong className="font-mono text-xl tabular-nums text-stone-900">{word.masteryPercentage}%</strong><br />Maestría</div>
          <div className="rounded-xl border border-stone-200 p-3 text-stone-700"><strong className="font-mono text-xl tabular-nums text-stone-900">{word.progress.directSuccessCount}</strong><br />Aciertos directos</div>
        </div>
        <Link
          to={`/learn/${word.categorySlug}?wordId=${word.id}`}
          onClick={onClose}
          className="mt-6 inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-emerald-900 px-5 py-3 text-center font-bold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-[0.98]"
        >
          Volver a jugar
        </Link>
      </div>
    </div>
  );
}

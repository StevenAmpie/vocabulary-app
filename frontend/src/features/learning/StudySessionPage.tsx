import { FormEvent, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AudioPlayerButton } from '../../components/AudioPlayerButton';
import { LearningExercise, RecordAttemptRequest, RecordAttemptResponse } from '../../types';
import { learningApi } from './learningApi';

type PageState = 'loading' | 'ready' | 'submitting' | 'answered' | 'load-error' | 'completed';

export function StudySessionPage() {
  const { categorySlug = 'technology' } = useParams();
  const [searchParams] = useSearchParams();
  const wordId = searchParams.get('wordId') ?? undefined;
  const [sessionId, setSessionId] = useState('');
  const [exercise, setExercise] = useState<LearningExercise | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [result, setResult] = useState<RecordAttemptResponse | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [total, setTotal] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [attemptStartedAt, setAttemptStartedAt] = useState(Date.now());
  const [pendingRequest, setPendingRequest] = useState<RecordAttemptRequest | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);

  async function loadNextExercise(activeSessionId: string) {
    setPageState('loading');
    setLoadError('');

    try {
      const next = await learningApi.getNextExercise(activeSessionId);
      if (!next) {
        setExercise(null);
        setCompletedCount(total);
        setPageState('completed');
        return;
      }

      setExercise(next.exercise);
      setTotal(next.session.total);
      setCompletedCount(Math.min(next.session.position - 1, next.session.total));
      setSelectedOptionId('');
      setResult(null);
      setSaveError('');
      setPendingRequest(null);
      setAttemptStartedAt(Date.now());
      setPageState('ready');
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : 'No pudimos cargar la palabra.');
      setPageState('load-error');
    }
  }

  async function startSession() {
    setPageState('loading');
    setExercise(null);
    setCompletedCount(0);
    setCorrectCount(0);
    setResult(null);

    try {
      const session = await learningApi.createSession({ categorySlug, wordId });
      setSessionId(session.sessionId);
      setTotal(session.total);
      await loadNextExercise(session.sessionId);
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : 'No pudimos iniciar la sesión.');
      setPageState('load-error');
    }
  }

  useEffect(() => {
    titleRef.current?.focus();
    void startSession();
    // La sesión solo se crea al montar la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, wordId]);

  useEffect(() => {
    if (pageState === 'answered' && result?.correct) {
      feedbackRef.current?.focus();
    }
    if (pageState === 'completed') {
      titleRef.current?.focus();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        void confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ['#059669', '#d97706', '#0f766e'] });
      }
    }
  }, [pageState, result]);

  useEffect(() => {
    if (pageState !== 'ready' || !exercise) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || target.isContentEditable ||
          ['TEXTAREA', 'SELECT'].includes(target.tagName) ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).name !== 'answer')) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < exercise.options.length && event.key.length === 1) {
        setSelectedOptionId(exercise.options[index].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exercise, pageState]);

  const sendAttempt = async (request: RecordAttemptRequest) => {
    if (!sessionId) return;
    setPageState('submitting');
    setSaveError('');

    try {
      const attemptResult = await learningApi.recordAttempt(sessionId, request);
      setResult(attemptResult);
      setPageState('answered');
      setPendingRequest(null);
    } catch {
      setPendingRequest(request);
      setSaveError('No pudimos guardar tu respuesta. Tu selección sigue aquí y puedes reintentar.');
      setPageState('ready');
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!exercise || !selectedOptionId || pageState !== 'ready') return;

    const request = {
      attemptId: crypto.randomUUID(),
      exerciseId: exercise.id,
      selectedOptionId,
      responseTimeMs: Math.max(0, Date.now() - attemptStartedAt),
    };
    void sendAttempt(request);
  };

  const handleContinue = () => {
    if (!result || !sessionId) return;
    setCorrectCount((count) => count + (result.correct ? 1 : 0));
    void loadNextExercise(sessionId);
  };

  if (pageState === 'completed') {
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-[0_2px_4px_rgba(28,25,23,0.04),0_20px_55px_-28px_rgba(6,95,70,0.2)] sm:p-12">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-800"><CheckCircle2 className="h-11 w-11" aria-hidden="true" /></span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Un paso más en tu recorrido</p>
        <h1 ref={titleRef} tabIndex={-1} className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Sesión completada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-stone-600">
          Practicaste {completedCount} palabras y resolviste correctamente {correctCount} interacciones.
        </p>
        {completedCount > 0 && <div className="mx-auto mt-8 max-w-[230px] rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="font-mono text-3xl font-bold tabular-nums text-emerald-900">{Math.round((correctCount / completedCount) * 100)}%</p><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">de aciertos</p></div>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void startSession()}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white transition-transform duration-200 hover:bg-emerald-900 active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Practicar otra vez
          </button>
          <Link
            to="/"
            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-stone-300 px-5 py-3 font-bold text-stone-800 transition-colors hover:bg-stone-50"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-7" aria-labelledby="study-title">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-stone-200 pb-6">
        <div>
          <Link to="/" className="inline-flex min-h-touch items-center gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-emerald-800">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Salir de la sesión
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Sesión de estudio</p>
          <h1 id="study-title" ref={titleRef} tabIndex={-1} className="mt-1 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
            {categorySlug === 'technology' ? 'Tecnología cotidiana' : categorySlug === 'office' ? 'Objetos de oficina' : categorySlug === 'fruits' ? 'Frutas' : categorySlug === 'verbs' ? 'Verbos en acción' : 'Sesión de vocabulario'}
          </h1>
        </div>
        <div className="w-full max-w-56">
          <div className="mb-1 flex justify-between text-sm font-semibold text-stone-700">
            <span>Progreso</span>
            <span className="font-mono tabular-nums">{Math.min(completedCount + 1, total)} de {total}</span>
          </div>
          <progress
            value={Math.min(completedCount, total)}
            max={total}
            aria-label={`${completedCount} de ${total} palabras completadas`}
            className="h-2 w-full overflow-hidden rounded-full accent-emerald-800"
          />
        </div>
      </header>

      {pageState === 'loading' && (
        <div role="status" className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          Preparando la siguiente palabra…
        </div>
      )}

      {pageState === 'load-error' && (
        <div role="alert" className="rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center">
          <h2 className="text-xl font-bold text-amber-950">No pudimos preparar la palabra</h2>
          <p className="mt-2 text-amber-900">{loadError}</p>
          <button
            type="button"
            onClick={() => void (sessionId ? loadNextExercise(sessionId) : startSession())}
            className="mt-4 min-h-touch rounded-xl bg-amber-900 px-5 py-3 font-bold text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {exercise && pageState !== 'loading' && pageState !== 'load-error' && (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_2px_4px_rgba(28,25,23,0.04),0_20px_55px_-28px_rgba(28,25,23,0.22)]">
          <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
            <div className="bg-[#f0eee8] p-3 sm:p-6 md:flex md:flex-col md:justify-between">
              {exercise.mode === 'word-to-image' ? <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 text-center sm:min-h-[300px]"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Escucha y reconoce</p><p lang="en" className="mt-4 font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{exercise.termEn}</p><p className="mt-2 font-mono text-sm text-stone-600">{exercise.phoneticIpa}</p></div> : exercise.mode === 'translation-to-word' ? <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 text-center sm:min-h-[300px]"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Traduce la acción</p><p className="mt-4 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">{exercise.translationEs || exercise.prompt}</p></div> : <img
                src={exercise.imageUrl}
                alt={exercise.imageDescription}
                className="mx-auto aspect-[4/3] max-h-[260px] w-full rounded-2xl border border-stone-200 bg-white object-contain p-3 sm:max-h-[350px] md:aspect-square md:max-h-none"
              />}
              {exercise.mode !== 'translation-to-word' && <div className="mt-3 flex items-center justify-center gap-3 pb-1 md:mt-5">
                <AudioPlayerButton
                  audioUrl={exercise.audioUrl}
                  label="Escuchar la pronunciación de la respuesta"
                />
                <span className="text-xs font-semibold text-stone-600">Escucha la palabra</span>
              </div>}
            </div>

            <div className="flex flex-col p-4 sm:p-8">
              <fieldset disabled={pageState === 'submitting' || pageState === 'answered'}>
                <legend className="text-xl font-extrabold leading-snug tracking-tight text-stone-900 sm:text-2xl">{exercise.prompt}</legend>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{exercise.mode === 'word-to-image' ? 'Elige la escena que representa esta acción.' : 'Elige una opción. Puedes aprender de cada intento.'}</p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {exercise.options.map((option, index) => {
                    const isSelected = option.id === selectedOptionId;
                    return (
                      <label
                        key={option.id}
                        className={`flex min-h-[56px] cursor-pointer ${exercise.mode === 'word-to-image' ? 'flex-col p-2' : 'items-center gap-3 px-4 py-3'} rounded-xl border-2 font-bold transition-all duration-150 active:scale-[0.99] focus-within:ring-2 focus-within:ring-emerald-800 focus-within:ring-offset-2 ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-[0_1px_2px_rgba(6,95,70,0.1)]'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-emerald-500 hover:bg-emerald-50/40'
                        }`}
                      >
                        {exercise.mode === 'word-to-image' && option.imageUrl && <img src={option.imageUrl} alt={option.imageDescription || `Escena de la opción ${index + 1}`} className="aspect-[4/3] w-full rounded-lg bg-stone-100 object-cover" />}
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => setSelectedOptionId(option.id)}
                          aria-keyshortcuts={`${index + 1}`}
                          className={`h-5 w-5 shrink-0 accent-emerald-800 ${exercise.mode === 'word-to-image' ? 'sr-only' : ''}`}
                        />
                        <span lang={exercise.mode === 'word-to-image' ? undefined : 'en'} className="min-w-0 break-words">{exercise.mode === 'word-to-image' ? `Opción ${index + 1}` : option.label}</span>
                        <kbd aria-hidden="true" className="ml-auto hidden rounded border border-current/20 px-2 py-0.5 font-mono text-xs opacity-70 sm:inline">{index + 1}</kbd>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {saveError && (
                <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                  <p>{saveError}</p>
                  {pendingRequest && (
                    <button
                      type="button"
                      onClick={() => void sendAttempt(pendingRequest)}
                      className="mt-2 min-h-touch font-bold underline underline-offset-4"
                    >
                      Reintentar guardado
                    </button>
                  )}
                </div>
              )}

              {result && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`mt-6 rounded-2xl border p-4 ${
                    result.correct ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <h2 ref={feedbackRef} tabIndex={-1} className="text-xl font-black text-stone-900">
                    {result.correct ? '¡Muy bien! La descubriste.' : 'Todavía no. La veremos de nuevo.'}
                  </h2>

                  {!result.correct && (
                    <p className="mt-2 flex gap-2 text-amber-950">
                      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <span><strong>Pista:</strong> {result.hint}</span>
                    </p>
                  )}

                  {result.correct && result.reveal && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p lang="en" className="text-2xl font-black text-emerald-900">{result.reveal.word.termEn}</p>
                        <p className="font-mono text-sm text-slate-600">{result.reveal.word.phoneticIpa}</p>
                        <p className="font-semibold text-emerald-800">{result.reveal.word.translationEs}</p>
                      </div>
                      <blockquote className="rounded-xl bg-white/80 p-3 text-slate-700">
                        <p lang="en">“{result.reveal.contextSentence.sentenceEn}”</p>
                        <p className="mt-1 text-sm text-slate-500">{result.reveal.contextSentence.translationEs}</p>
                      </blockquote>
                      <AudioPlayerButton
                        audioUrl={result.reveal.word.audioUrl}
                        fallbackText={result.reveal.word.termEn}
                        label={`Escuchar pronunciación de ${result.reveal.word.termEn}`}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6">
                {pageState !== 'answered' ? (
                  <button
                    type="submit"
                    disabled={!selectedOptionId || pageState === 'submitting'}
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-base font-bold text-white transition-transform duration-150 hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-600"
                  >
                    {pageState === 'submitting' ? 'Comprobando…' : 'Comprobar respuesta'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-base font-bold text-white transition-transform duration-150 hover:bg-stone-800 active:scale-[0.99]"
                  >
                    {result?.correct ? 'Siguiente palabra' : 'Continuar y practicarla después'}
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

import { FormEvent, useEffect, useRef, useState } from 'react';
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
    }
  }, [pageState, result]);

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
      <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
        <h1 ref={titleRef} tabIndex={-1} className="mt-4 text-3xl font-black text-slate-900">
          Sesión completada
        </h1>
        <p className="mt-3 text-slate-600">
          Practicaste {completedCount} palabras y resolviste correctamente {correctCount} interacciones.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void startSession()}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Practicar otra vez
          </button>
          <Link
            to="/"
            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6" aria-labelledby="study-title">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex min-h-touch items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Salir de la sesión
          </Link>
          <h1 id="study-title" ref={titleRef} tabIndex={-1} className="mt-2 text-3xl font-black text-slate-900">
            {categorySlug === 'technology' ? 'Tecnología cotidiana' : categorySlug === 'office' ? 'Objetos de oficina' : categorySlug === 'fruits' ? 'Frutas' : 'Sesión de vocabulario'}
          </h1>
        </div>
        <div className="min-w-48">
          <div className="mb-1 flex justify-between text-sm font-semibold text-slate-600">
            <span>Progreso</span>
            <span>{Math.min(completedCount + 1, total)} de {total}</span>
          </div>
          <progress
            value={Math.min(completedCount, total)}
            max={total}
            aria-label={`${completedCount} de ${total} palabras completadas`}
            className="h-2 w-full overflow-hidden rounded-full accent-emerald-600"
          />
        </div>
      </header>

      {pageState === 'loading' && (
        <div role="status" className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
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
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
            <div className="bg-slate-100 p-4 sm:p-6">
              <img
                src={exercise.imageUrl}
                alt={exercise.imageDescription}
                className="aspect-square w-full rounded-2xl object-cover shadow-inner"
              />
              <div className="mt-4 flex justify-center">
                <AudioPlayerButton
                  audioUrl={exercise.audioUrl}
                  label="Escuchar la pronunciación de la respuesta"
                />
              </div>
            </div>

            <div className="flex flex-col p-5 sm:p-8">
              <fieldset disabled={pageState === 'submitting' || pageState === 'answered'}>
                <legend className="text-xl font-extrabold text-slate-900">{exercise.prompt}</legend>
                <p className="mt-2 text-sm text-slate-500">Selecciona una opción. Los errores te ayudan a aprender y no tienen penalización.</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {exercise.options.map((option) => {
                    const isSelected = option.id === selectedOptionId;
                    return (
                      <label
                        key={option.id}
                        className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-bold transition-colors ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => setSelectedOptionId(option.id)}
                          className="h-5 w-5 accent-emerald-600"
                        />
                        <span lang="en">{option.label}</span>
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
                    result.correct ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <h2 ref={feedbackRef} tabIndex={-1} className="text-xl font-black text-slate-900">
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
                    className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    {pageState === 'submitting' ? 'Comprobando…' : 'Comprobar respuesta'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
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

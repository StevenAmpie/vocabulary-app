import React, { useId, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerButtonProps {
  audioUrl?: string;
  fallbackText?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  audioUrl,
  fallbackText,
  label = 'Escuchar pronunciación nativa',
  size = 'md',
  className = '',
}) => {
  const errorId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const playAudio = async () => {
    try {
      setHasError(false);
      setIsPlaying(true);

      if (!audioUrl && fallbackText && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          setHasError(true);
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      if (!audioUrl) {
        throw new Error('No hay audio disponible');
      }

      const audio = new Audio(audioUrl);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setHasError(true);
      };

      await audio.play();
    } catch {
      setIsPlaying(false);
      setHasError(true);
    }
  };

  const sizeClasses = {
    sm: 'w-11 h-11 p-2.5 text-sm',
    md: 'w-12 h-12 p-3 text-base',
    lg: 'w-16 h-16 p-4 text-xl',
  };

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={playAudio}
        disabled={isPlaying}
        aria-label={label}
        aria-describedby={hasError ? errorId : undefined}
        className={`relative flex min-h-touch min-w-touch items-center justify-center rounded-full bg-emerald-900 text-white shadow-[0_1px_2px_rgba(28,25,23,0.08),0_8px_20px_-8px_rgba(6,95,70,0.45)] transition-transform duration-150 hover:bg-emerald-800 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 ${sizeClasses[size]} ${className}`}
      >
        {hasError ? (
          <VolumeX className="w-full h-full" aria-hidden="true" />
        ) : (
          <Volume2 className={`h-full w-full ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
        )}
      </button>
      {hasError && (
        <span id={errorId} role="status" className="max-w-40 text-center text-xs font-medium text-amber-800">
          No pudimos reproducir el audio. Puedes continuar con la pista visual.
        </span>
      )}
    </span>
  );
};

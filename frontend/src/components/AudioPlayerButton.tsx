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
    sm: 'w-10 h-10 p-2 text-sm',
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
        className={`min-w-touch min-h-touch rounded-full flex items-center justify-center transition-all 
          bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-95 
          disabled:opacity-75 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-emerald-300 ${sizeClasses[size]} ${className}`}
      >
        {hasError ? (
          <VolumeX className="w-full h-full" aria-hidden="true" />
        ) : (
          <Volume2 className={`w-full h-full ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
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

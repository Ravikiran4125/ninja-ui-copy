'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import type { VoiceRecorderState } from './types';

interface VoiceRecorderProps {
  state: VoiceRecorderState;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function VoiceRecorder({ state, onStop, onPause, onResume }: VoiceRecorderProps) {
  const [displayDuration, setDisplayDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRecording && !state.isPaused) {
      interval = setInterval(() => {
        setDisplayDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRecording, state.isPaused]);

  useEffect(() => {
    if (!state.isRecording) {
      setDisplayDuration(0);
    }
  }, [state.isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Recording Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 dark:text-red-300 font-medium">
              {state.isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>

          {/* Duration */}
          <span className="text-red-600 dark:text-red-400 font-mono">
            {formatDuration(displayDuration)}
          </span>

          {/* Audio Level Indicator */}
          <div className="flex items-center gap-1">
            <Volume2 size={16} className="text-red-500" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-1 h-4 rounded-full transition-all duration-100',
                    state.audioLevel > (i + 1) * 20
                      ? 'bg-red-500'
                      : 'bg-red-200 dark:bg-red-800'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={state.isPaused ? onResume : onPause}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
            title={state.isPaused ? "Resume" : "Pause"}
          >
            {state.isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <button
            onClick={onStop}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Stop recording"
          >
            <Square size={16} />
          </button>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mt-3 flex items-center justify-center gap-1 h-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-1 bg-red-400 rounded-full transition-all duration-100',
              state.isRecording && !state.isPaused
                ? 'animate-pulse'
                : ''
            )}
            style={{
              height: `${Math.random() * 100 + 20}%`,
              animationDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}
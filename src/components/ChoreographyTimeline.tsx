import React from 'react';
import { ChoreographyShot } from '../types/cinema';
import { Camera, Music, Sparkles, Wind, Eye, Check } from 'lucide-react';

interface ChoreographyTimelineProps {
  shots: ChoreographyShot[];
  currentShotIndex: number;
  onSelectShot: (index: number) => void;
  onSeek: (time: number) => void;
}

export const ChoreographyTimeline: React.FC<ChoreographyTimelineProps> = ({
  shots,
  currentShotIndex,
  onSelectShot,
  onSeek,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <span>Choreography Storyboard & Dance Beats</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Shot-by-shot Bollywood dance choreography synchronized with tempo, mudras, and camera trajectories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shots.map((shot, idx) => {
          const isActive = idx === currentShotIndex;

          return (
            <div
              key={shot.id}
              onClick={() => {
                onSelectShot(idx);
                onSeek(shot.startTime);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                isActive
                  ? 'bg-zinc-900 border-amber-500 shadow-md shadow-amber-950/20'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
              )}

              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    0{shot.shotNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors">
                      {shot.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      {shot.stageName} · {shot.duration}s
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800">
                  {shot.startTime.toFixed(1)}s
                </span>
              </div>

              {/* Dance Step description */}
              <p className="text-xs text-zinc-300 mb-2.5 leading-relaxed">
                {shot.danceStep}
              </p>

              {/* Technical specs badges */}
              <div className="space-y-1.5 text-[11px] border-t border-zinc-800/80 pt-2">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-zinc-300 font-medium">{shot.mudraName}:</span>
                  <span className="truncate text-zinc-400">{shot.mudraMeaning}</span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate text-zinc-300">{shot.cameraMovement}</span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Wind className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate text-zinc-400">{shot.sareeFabricPhysics}</span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Music className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate text-amber-300/90">{shot.audioBeatSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

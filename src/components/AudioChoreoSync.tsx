import React, { useRef, useState, useEffect } from 'react';
import { AUDIO_PRESETS } from '../data/shotsData';
import { soundEngine } from '../services/soundEngine';
import { AudioPreset } from '../types/cinema';
import {
  Music,
  Upload,
  Play,
  Pause,
  Sliders,
  Volume2,
  Disc,
  Activity,
  Check,
} from 'lucide-react';

interface AudioChoreoSyncProps {
  currentPreset: AudioPreset;
  onSelectPreset: (preset: AudioPreset) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
}

export const AudioChoreoSync: React.FC<AudioChoreoSyncProps> = ({
  currentPreset,
  onSelectPreset,
  isPlaying,
  onTogglePlay,
  currentTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bpm, setBpm] = useState<number>(currentPreset.bpm);
  const [volume, setVolume] = useState<number>(0.85);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Audio Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const freqData = soundEngine.getFrequencyData();
      const numBars = 32;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const val = freqData[i] || (isPlaying ? Math.sin(Date.now() * 0.01 + i) * 80 + 90 : 8);
        const barHeight = Math.max(4, (val / 255) * (height - 6));

        // Gradient from warm amber to rose gold
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.7, '#fbbf24');
        grad.addColorStop(1, '#e11d48');

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    soundEngine.setTempo(newBpm);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const name = await soundEngine.loadCustomAudio(file);
      setCustomTrackName(name);
      // Auto play custom track
      soundEngine.play(0);
    } catch (err) {
      console.error('Failed to load audio file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToPreset = (preset: AudioPreset) => {
    setCustomTrackName(null);
    soundEngine.resetToPreset();
    onSelectPreset(preset);
    handleBpmChange(preset.bpm);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            <span>Music Synchronization & Beat Controller</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time audio clock driving choreography steps, twirl velocity, camera beat shakes, and mudra cues.
          </p>
        </div>

        {/* Upload Custom Hindi Song Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Decoding Audio...' : 'Upload Hindi Song (MP3)'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Visualizer & Master Control */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                {customTrackName ? `Custom Song: ${customTrackName}` : currentPreset.title}
              </span>
              <span className="text-[11px] text-zinc-400">
                {customTrackName ? 'Custom Audio Track' : currentPreset.subTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Beat'}</span>
            </button>
          </div>
        </div>

        {/* Canvas Waveform Spectrum */}
        <div className="h-14 w-full bg-black/40 rounded-lg p-1 border border-zinc-900 overflow-hidden relative">
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute top-1.5 right-2 text-[10px] font-mono text-zinc-500">
            AUDIO SPECTRUM (FFT 256)
          </div>
        </div>

        {/* Sliders: BPM Tempo & Volume */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Tempo (BPM):
              </span>
              <span className="font-mono text-amber-300 font-semibold">{bpm} BPM</span>
            </div>
            <input
              type="range"
              min="70"
              max="160"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                Playback Volume:
              </span>
              <span className="font-mono text-zinc-300 font-semibold">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Preset Bollywood Soundtracks Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-300 block">
          Curated Bollywood Dance Grooves
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AUDIO_PRESETS.map((preset) => {
            const isSelected = !customTrackName && currentPreset.id === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => handleResetToPreset(preset)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-500 shadow-sm'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-zinc-200">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {preset.subTitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                    {preset.bpm} BPM
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

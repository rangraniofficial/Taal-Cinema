import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Camera,
  Layers,
  Sliders,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ChoreographyShot, CostumeOption, VisualFXSettings } from '../types/cinema';
import { soundEngine } from '../services/soundEngine';

interface ReelPlayerProps {
  shots: ChoreographyShot[];
  currentShotIndex: number;
  onShotChange: (index: number) => void;
  selectedCostume: CostumeOption;
  onCostumeChange: (costume: CostumeOption) => void;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  totalDuration: number;
  currentSongTitle: string;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  shots,
  currentShotIndex,
  onShotChange,
  selectedCostume,
  onCostumeChange,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  totalDuration,
  currentSongTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [beatPulse, setBeatPulse] = useState(false);
  const [showFxControls, setShowFxControls] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  const [fx, setFx] = useState<VisualFXSettings>({
    goldenFairyLights: true,
    marigoldPetals: true,
    rosePetals: true,
    goldZardoziGleam: true,
    cinematicLensFlares: true,
    beatCameraShake: true,
    cinematicGrain: true,
    aspectRatioLetterbox: true,
  });

  const activeShot = shots[currentShotIndex] || shots[0];

  // Pick displayed image based on costume preference or shot specific image
  const getDisplayedImage = () => {
    // If user explicitly picked cream saree and shot is not specifically forced
    if (selectedCostume === 'cream-pink') {
      return activeShot.id === 3
        ? activeShot.imageSrc
        : '/src/assets/images/stage_cream_saree_dance_1793272021636.jpg';
    }
    if (selectedCostume === 'deep-maroon' && activeShot.id === 6) {
      return activeShot.imageSrc;
    }
    return activeShot.imageSrc;
  };

  // Sound Engine Beat Subscription
  useEffect(() => {
    const unsub = soundEngine.subscribeBeat((_, isDownbeat) => {
      if (isDownbeat && fx.beatCameraShake) {
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 120);
      }
    });
    return unsub;
  }, [fx.beatCameraShake]);

  // Canvas Particle & Stage Lighting FX Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles: Fairy lights, Marigold petals, Rose petals, Zardozi glints
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rotation: number;
      vRot: number;
      type: 'bokeh' | 'marigold' | 'rose' | 'glint';
    }

    const particles: Particle[] = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      const type: 'bokeh' | 'marigold' | 'rose' | 'glint' =
        typeRand < 0.4 ? 'bokeh' : typeRand < 0.65 ? 'marigold' : typeRand < 0.85 ? 'rose' : 'glint';

      particles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: type === 'bokeh' ? (Math.random() - 0.5) * 0.3 : Math.random() * 1.5 + 0.6,
        size:
          type === 'bokeh'
            ? Math.random() * 26 + 12
            : type === 'glint'
              ? Math.random() * 6 + 3
              : Math.random() * 12 + 8,
        color:
          type === 'bokeh'
            ? 'rgba(253, 224, 71, '
            : type === 'marigold'
              ? 'rgba(245, 158, 11, '
              : type === 'rose'
                ? 'rgba(225, 29, 72, '
                : 'rgba(255, 255, 255, ',
        alpha: Math.random() * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      const beatEnergy = isPlaying ? soundEngine.getBeatEnergy() : 0.15;
      const pulseMultiplier = 1 + beatEnergy * 0.6;

      // 1. Fairy lights bokeh background
      if (fx.goldenFairyLights) {
        particles.forEach((p) => {
          if (p.type === 'bokeh') {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            const rad = p.size * pulseMultiplier;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
            grad.addColorStop(0, `${p.color}${p.alpha * 0.7})`);
            grad.addColorStop(0.5, `${p.color}${p.alpha * 0.25})`);
            grad.addColorStop(1, `${p.color}0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 2. Anamorphic horizontal lens flare streak
      if (fx.cinematicLensFlares) {
        const flareY = height * 0.32 + Math.sin(time * 0.5) * 15;
        const flareGrad = ctx.createLinearGradient(0, flareY, width, flareY);
        flareGrad.addColorStop(0, 'rgba(234, 179, 8, 0)');
        flareGrad.addColorStop(0.4, 'rgba(234, 179, 8, 0.04)');
        flareGrad.addColorStop(0.5, `rgba(255, 240, 200, ${0.15 + beatEnergy * 0.25})`);
        flareGrad.addColorStop(0.6, 'rgba(234, 179, 8, 0.04)');
        flareGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, flareY - 14, width, 28);
      }

      // 3. Falling Marigold and Rose flower petals
      particles.forEach((p) => {
        if (
          (p.type === 'marigold' && fx.marigoldPetals) ||
          (p.type === 'rose' && fx.rosePetals)
        ) {
          p.y += p.vy;
          p.x += Math.sin(time + p.y * 0.02) * 1.2 + p.vx;
          p.rotation += p.vRot;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.beginPath();
          // Organic curved petal geometry
          ctx.ellipse(0, 0, p.size * 0.6, p.size, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 4. Gold Zardozi Glints
        if (p.type === 'glint' && fx.goldZardoziGleam) {
          p.alpha += (Math.random() - 0.5) * 0.1;
          p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.strokeStyle = `rgba(255, 235, 170, ${p.alpha})`;
          ctx.lineWidth = 1.5;

          // 4-point sparkle cross
          const gLen = p.size * (1 + beatEnergy * 0.5);
          ctx.beginPath();
          ctx.moveTo(-gLen, 0);
          ctx.lineTo(gLen, 0);
          ctx.moveTo(0, -gLen);
          ctx.lineTo(0, gLen);
          ctx.stroke();

          ctx.restore();
        }
      });

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [fx, isPlaying]);

  // Camera Motion simulation style per shot
  const getCameraMotionClass = () => {
    switch (activeShot.cameraType) {
      case 'medium-shot':
        return 'scale-105 transition-transform duration-3000 ease-out';
      case 'facial-closeup':
        return 'scale-115 translate-y-3 transition-transform duration-2500 ease-in-out';
      case 'tracking-full':
        return 'scale-100 translate-x-2 transition-transform duration-4000 ease-in-out';
      case 'orbit-360':
        return 'scale-110 rotate-1 transition-all duration-1000 ease-linear';
      case 'cinematic-push':
        return 'scale-120 transition-transform duration-5000 ease-out';
      default:
        return 'scale-100';
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      soundEngine.setVolume(0.85);
      setIsMuted(false);
    } else {
      soundEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.5, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setPlaybackSpeed(next);
    soundEngine.setTempo(128 * next);
  };

  const handleCaptureFrame = () => {
    const link = document.createElement('a');
    link.download = `TaalCinema_Shot_${activeShot.shotNumber}_${activeShot.title.replace(/\s+/g, '_')}.png`;
    link.href = getDisplayedImage();
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
        theaterMode ? 'fixed inset-0 z-50 bg-black/95 p-4' : 'w-full'
      }`}
    >
      {/* 9:16 Cinematic Reel Frame */}
      <div
        className={`relative w-full max-w-[420px] aspect-[9/16] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-950/40 bg-zinc-950 transition-all ${
          beatPulse ? 'scale-[1.012] border-amber-400/60' : 'scale-100'
        }`}
      >
        {/* Dynamic Background Image with Simulated Cinema Camera Move */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getDisplayedImage()}
            alt={activeShot.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-top select-none pointer-events-none ${getCameraMotionClass()}`}
          />
        </div>

        {/* Cinematic Vignette & Lighting Contrast Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/70 pointer-events-none" />

        {/* Real-time HTML5 Canvas FX Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Film Letterbox Bars (Optional toggle) */}
        {fx.aspectRatioLetterbox && (
          <>
            <div className="absolute top-0 left-0 right-0 h-4 bg-black z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black z-20" />
          </>
        )}

        {/* Top Header Overlay: 4K 24FPS Badge & Track Info */}
        <div className="absolute top-5 left-4 right-4 z-30 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wider text-amber-300 uppercase font-cinzel">
              TAAL CINEMA
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400">4K HDR</span>
            <span className="text-zinc-500">·</span>
            <span className="text-amber-400/90 font-mono">24 FPS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFxControls(!showFxControls)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showFxControls
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-black/50 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Visual Effects Layer"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="p-1.5 rounded-lg bg-black/50 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Expand View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Song & Choreo Kicker */}
        <div className="absolute top-14 left-4 right-4 z-30">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
            <span className="text-amber-400 font-medium">Song:</span>
            <span className="truncate max-w-[210px] text-zinc-200">{currentSongTitle}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-300 font-mono">128 BPM</span>
          </div>
        </div>

        {/* FX Quick Settings Panel Dropdown */}
        {showFxControls && (
          <div className="absolute top-20 right-4 z-40 w-56 p-3 rounded-xl bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-xs shadow-xl space-y-2">
            <div className="flex items-center justify-between font-semibold text-zinc-200 pb-1 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Stage FX Filters
              </span>
              <button
                onClick={() => setShowFxControls(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Golden Fairy Lights</span>
              <input
                type="checkbox"
                checked={fx.goldenFairyLights}
                onChange={(e) => setFx({ ...fx, goldenFairyLights: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Marigold Petals</span>
              <input
                type="checkbox"
                checked={fx.marigoldPetals}
                onChange={(e) => setFx({ ...fx, marigoldPetals: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Gulab Rose Petals</span>
              <input
                type="checkbox"
                checked={fx.rosePetals}
                onChange={(e) => setFx({ ...fx, rosePetals: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Zardozi Gold Gleam</span>
              <input
                type="checkbox"
                checked={fx.goldZardoziGleam}
                onChange={(e) => setFx({ ...fx, goldZardoziGleam: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Anamorphic Flare</span>
              <input
                type="checkbox"
                checked={fx.cinematicLensFlares}
                onChange={(e) => setFx({ ...fx, cinematicLensFlares: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Bass Beat Cam Shake</span>
              <input
                type="checkbox"
                checked={fx.beatCameraShake}
                onChange={(e) => setFx({ ...fx, beatCameraShake: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>
          </div>
        )}

        {/* Center Play Overlay Trigger (Click anywhere in frame to play/pause) */}
        <div
          onClick={onTogglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group"
        >
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          )}
        </div>

        {/* Active Shot Information Card Overlaid near bottom */}
        <div className="absolute bottom-16 left-4 right-4 z-30 space-y-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Shot {activeShot.shotNumber} of {shots.length}: {activeShot.title}
            </span>
          </div>

          <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs space-y-1">
            <div className="text-zinc-200 font-semibold flex items-center justify-between">
              <span>{activeShot.stageName}</span>
              <span className="text-[11px] text-amber-400 font-mono">{activeShot.mudraName}</span>
            </div>
            <p className="text-zinc-300 text-[11px] line-clamp-2 leading-relaxed">
              {activeShot.danceStep}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-0.5">
              <span>Camera: {activeShot.cameraMovement.split(':')[0]}</span>
              <span>·</span>
              <span className="text-amber-300/80">Pallu: {activeShot.sareeFabricPhysics.slice(0, 36)}...</span>
            </div>
          </div>
        </div>

        {/* Bottom Scrubber Timeline Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent p-3 pt-6">
          {/* Progress track */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * totalDuration);
            }}
            className="relative w-full h-2 bg-zinc-800 rounded-full cursor-pointer group mb-3"
          >
            {/* Shot boundaries */}
            {shots.map((s, idx) => (
              <div
                key={s.id}
                style={{ left: `${(s.startTime / totalDuration) * 100}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400/40 z-10"
                title={s.title}
              />
            ))}

            {/* Filled bar */}
            <div
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>

          {/* Reel Transport Controls */}
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <button
                onClick={onTogglePlay}
                className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => onSeek(0)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title="Restart Reel"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleMuteToggle}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-[11px] text-zinc-400">
                {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeedToggle}
                className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-[11px] font-mono text-amber-300 hover:border-amber-500 transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              <button
                onClick={handleCaptureFrame}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-colors"
                title="Capture Frame"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Shot Navigator Pill Strip below the 9:16 player */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto max-w-[420px] w-full p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        {shots.map((shot, idx) => {
          const isActive = idx === currentShotIndex;
          return (
            <button
              key={shot.id}
              onClick={() => {
                onShotChange(idx);
                onSeek(shot.startTime);
              }}
              className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all text-center ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Shot {shot.shotNumber}
            </button>
          );
        })}
      </div>

      {/* Costume Variant Selector Strip */}
      <div className="mt-3 flex items-center justify-between max-w-[420px] w-full px-2 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Wardrobe:
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCostumeChange('royal-blue')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              selectedCostume === 'royal-blue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Royal Blue & Gold
          </button>
          <button
            onClick={() => onCostumeChange('cream-pink')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              selectedCostume === 'cream-pink'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cream & Pink Floral
          </button>
          <button
            onClick={() => onCostumeChange('deep-maroon')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              selectedCostume === 'deep-maroon'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Royal Maroon
          </button>
        </div>
      </div>
    </div>
  );
};

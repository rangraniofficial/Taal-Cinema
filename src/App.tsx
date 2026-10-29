import React, { useState, useEffect } from 'react';
import {
  CHOREOGRAPHY_SEQUENCE,
  AUDIO_PRESETS,
  BASE_REFERENCE_IMAGE,
  UNIVERSAL_NEGATIVE_PROMPT,
} from './data/shotsData';
import { CostumeOption, AudioPreset } from './types/cinema';
import { soundEngine } from './services/soundEngine';
import { ReelPlayer } from './components/ReelPlayer';
import { ChoreographyTimeline } from './components/ChoreographyTimeline';
import { CharacterConsistencyInspector } from './components/CharacterConsistencyInspector';
import { AudioChoreoSync } from './components/AudioChoreoSync';
import { VideoPromptStudio } from './components/VideoPromptStudio';
import { DirectorChat } from './components/DirectorChat';
import {
  Film,
  Sparkles,
  Music,
  ShieldCheck,
  Clapperboard,
  Download,
  Share2,
  Layers,
  Flame,
  Info,
} from 'lucide-react';

export default function App() {
  const [shots, setShots] = useState(CHOREOGRAPHY_SEQUENCE);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [selectedCostume, setSelectedCostume] = useState<CostumeOption>('royal-blue');
  const [currentAudioPreset, setCurrentAudioPreset] = useState<AudioPreset>(AUDIO_PRESETS[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'choreography' | 'consistency' | 'music' | 'prompts' | 'director'
  >('choreography');
  const [showExportToast, setShowExportToast] = useState(false);

  const totalDuration = 30; // 30-second vertical reel

  // Subscribe to Sound Engine time updates to auto-sync the reel shots
  useEffect(() => {
    const unsub = soundEngine.subscribeTimeUpdate((time) => {
      setCurrentTime(time);

      // Determine which shot is active based on time
      const matchIdx = shots.findIndex(
        (s) => time >= s.startTime && time < s.startTime + s.duration
      );
      if (matchIdx !== -1 && matchIdx !== currentShotIndex) {
        setCurrentShotIndex(matchIdx);
      }
    });

    return unsub;
  }, [shots, currentShotIndex]);

  // Spacebar hotkey to toggle playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime]);

  const handleTogglePlay = () => {
    soundEngine.togglePlay(currentTime);
    setIsPlaying(soundEngine.getIsPlaying());
  };

  const handleSeek = (timeSec: number) => {
    setCurrentTime(timeSec);
    const matchIdx = shots.findIndex(
      (s) => timeSec >= s.startTime && timeSec < s.startTime + s.duration
    );
    if (matchIdx !== -1) {
      setCurrentShotIndex(matchIdx);
    }
    if (isPlaying) {
      soundEngine.play(timeSec);
    }
  };

  const handleSelectShot = (index: number) => {
    setCurrentShotIndex(index);
    handleSeek(shots[index].startTime);
  };

  const handleExportFullProject = () => {
    const projectData = {
      title: 'Taal Cinema - Ultra-Realistic Bollywood Dance Music Video',
      character: {
        description: '24-year-old Indian woman in elegant saree',
        referenceMasterFile: 'Glamorous_Blue_and_Gold_Saree_Portrait_15a6b616.png',
        activeCostume: selectedCostume,
      },
      audio: {
        trackTitle: currentAudioPreset.title,
        bpm: currentAudioPreset.bpm,
        durationSeconds: totalDuration,
      },
      shots: shots.map((s) => ({
        shotNumber: s.shotNumber,
        title: s.title,
        stage: s.stageName,
        mudra: s.mudraName,
        timestamp: `${s.startTime.toFixed(1)}s - ${(s.startTime + s.duration).toFixed(1)}s`,
        cameraMovement: s.cameraMovement,
        fabricPhysics: s.sareeFabricPhysics,
        videoPrompts: s.videoPrompts,
      })),
      negativePrompt: UNIVERSAL_NEGATIVE_PROMPT,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TaalCinema_Bollywood_Dance_Video_Reel_Package.json`;
    link.click();
    URL.revokeObjectURL(url);

    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const activeShot = shots[currentShotIndex] || shots[0];

  return (
    <div className="min-h-screen bg-[#07070b] text-[#f3f2f8] flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Bar Contract (1 row, 3 zones separated by gap-8) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a
          href="/"
          className="text-lg font-bold tracking-wider text-amber-400 whitespace-nowrap shrink-0 font-cinzel hover:text-amber-300 transition-colors"
        >
          TAAL CINEMA
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => setActiveTab('choreography')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'choreography' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Choreography
          </button>
          <button
            onClick={() => setActiveTab('consistency')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'consistency' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Character Lock
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'music' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Music Sync
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'prompts' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            AI Prompts
          </button>
          <button
            onClick={() => setActiveTab('director')}
            className={`hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'director' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Director Chat
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportFullProject}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm shadow-amber-400/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reel Storyboard</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 9:16 Vertical Reel Player (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <ReelPlayer
            shots={shots}
            currentShotIndex={currentShotIndex}
            onShotChange={handleSelectShot}
            selectedCostume={selectedCostume}
            onCostumeChange={setSelectedCostume}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            totalDuration={totalDuration}
            currentSongTitle={currentAudioPreset.title}
          />

          {/* Quick Info bar under player */}
          <div className="w-full max-w-[420px] mt-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-medium">
              <span>9:16 Vertical Video Reel</span>
              <span className="text-amber-400 font-mono">1080 × 1920 (4K Cinema)</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              Optimized for YouTube Shorts, Instagram Reels, and Facebook Reels. Character preserved from master reference image.
            </p>
          </div>
        </div>

        {/* Right Column: Studio Panels & Controls (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Typography & Brief Context */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Bollywood Dance Music Video</span>
              <span aria-hidden="true">·</span>
              <span>24yo Indian Dancer</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400/90 font-medium">Character Consistency Locked</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-serif-cinematic">
              Cinematic Bollywood Dance Studio
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Featuring a beautiful 24-year-old Indian woman in an elegant saree performing graceful, energetic Bollywood dance choreography synchronized with Hindi music beats on a luxurious wedding stage.
            </p>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('choreography')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'choreography'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Choreography</span>
            </button>

            <button
              onClick={() => setActiveTab('consistency')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'consistency'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identity Lock</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'music'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'prompts'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Prompts</span>
            </button>

            <button
              onClick={() => setActiveTab('director')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'director'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5 text-rose-400" />
              <span>Director Chat</span>
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/40">
            {activeTab === 'choreography' && (
              <ChoreographyTimeline
                shots={shots}
                currentShotIndex={currentShotIndex}
                onSelectShot={handleSelectShot}
                onSeek={handleSeek}
              />
            )}

            {activeTab === 'consistency' && (
              <CharacterConsistencyInspector
                currentFrameImage={activeShot.imageSrc}
                currentShotNumber={activeShot.shotNumber}
                selectedCostume={selectedCostume}
                onSelectCostume={setSelectedCostume}
              />
            )}

            {activeTab === 'music' && (
              <AudioChoreoSync
                currentPreset={currentAudioPreset}
                onSelectPreset={setCurrentAudioPreset}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                currentTime={currentTime}
              />
            )}

            {activeTab === 'prompts' && (
              <VideoPromptStudio
                currentShot={activeShot}
                selectedCostume={selectedCostume}
              />
            )}

            {activeTab === 'director' && (
              <DirectorChat
                currentShotNumber={activeShot.shotNumber}
                currentShotTitle={activeShot.title}
              />
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-zinc-900 border border-amber-500/50 text-xs text-zinc-200 shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Full Bollywood Dance Reel Storyboard & Prompts Exported!</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Taal Cinema · Ultra-Realistic Bollywood Dance Music Video Studio</span>
          <span>Consistent Character AI Video Generation (Veo 2, Sora, Kling, Runway)</span>
        </div>
      </footer>
    </div>
  );
}

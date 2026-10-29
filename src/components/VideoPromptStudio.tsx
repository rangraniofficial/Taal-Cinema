import React, { useState } from 'react';
import { ChoreographyShot, CostumeOption } from '../types/cinema';
import { UNIVERSAL_NEGATIVE_PROMPT } from '../data/shotsData';
import {
  Copy,
  Check,
  Download,
  Sparkles,
  Film,
  Camera,
  Layers,
  Code,
  RefreshCw,
} from 'lucide-react';

interface VideoPromptStudioProps {
  currentShot: ChoreographyShot;
  selectedCostume: CostumeOption;
}

export const VideoPromptStudio: React.FC<VideoPromptStudioProps> = ({
  currentShot,
  selectedCostume,
}) => {
  const [activeEngine, setActiveEngine] = useState<'veo2' | 'sora' | 'kling' | 'runway'>('veo2');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingAiPrompt, setIsGeneratingAiPrompt] = useState(false);
  const [customAiPromptSuite, setCustomAiPromptSuite] = useState<any | null>(null);

  const getEnginePrompt = () => {
    if (customAiPromptSuite) {
      return customAiPromptSuite.mainPrompt;
    }
    switch (activeEngine) {
      case 'veo2':
        return currentShot.videoPrompts.veo2;
      case 'sora':
        return currentShot.videoPrompts.sora;
      case 'kling':
        return currentShot.videoPrompts.kling;
      case 'runway':
        return currentShot.videoPrompts.runway;
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateAiPrompt = async () => {
    try {
      setIsGeneratingAiPrompt(true);
      const res = await fetch('/api/gemini/generate-video-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shotName: `Shot ${currentShot.shotNumber}: ${currentShot.title} (${currentShot.stageName})`,
          outfitStyle:
            selectedCostume === 'cream-pink'
              ? 'Cream raw silk saree with delicate pink floral embroidery, gold border, and matching blouse'
              : 'Royal blue georgette saree with intricate gold zardozi embroidery and matching blouse',
          cameraAngle: currentShot.cameraMovement,
          intensity: currentShot.beatIntensity,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCustomAiPromptSuite(data.data);
      }
    } catch (e) {
      console.error('Failed to generate AI video prompt suite:', e);
    } finally {
      setIsGeneratingAiPrompt(false);
    }
  };

  const handleDownloadPackage = () => {
    const pkg = {
      project: 'Taal Cinema - Ultra-Realistic Bollywood Dance Music Video',
      activeShot: {
        number: currentShot.shotNumber,
        title: currentShot.title,
        stage: currentShot.stageName,
        mudra: currentShot.mudraName,
        cameraMotion: currentShot.cameraMovement,
      },
      wardrobe: selectedCostume,
      prompts: {
        googleVeo2: currentShot.videoPrompts.veo2,
        openAiSora: currentShot.videoPrompts.sora,
        kling15: currentShot.videoPrompts.kling,
        runwayGen3: currentShot.videoPrompts.runway,
        negativePrompt: UNIVERSAL_NEGATIVE_PROMPT,
      },
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaalCinema_Shot_${currentShot.shotNumber}_Prompts.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>AI Video Prompt Director (Veo 2 / Sora / Kling / Runway)</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Export production-ready video prompts with exact character preservation, camera orbits, and physics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiPrompt}
            disabled={isGeneratingAiPrompt}
            className="px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiPrompt ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAiPrompt ? 'Gemini Generating...' : 'Regenerate Prompt Suite'}</span>
          </button>

          <button
            onClick={handleDownloadPackage}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Engine Target Selector */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
        <button
          onClick={() => setActiveEngine('veo2')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeEngine === 'veo2'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Google Veo 2
        </button>
        <button
          onClick={() => setActiveEngine('sora')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeEngine === 'sora'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          OpenAI Sora
        </button>
        <button
          onClick={() => setActiveEngine('kling')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeEngine === 'kling'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Kling 1.5
        </button>
        <button
          onClick={() => setActiveEngine('runway')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeEngine === 'runway'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Runway Gen-3
        </button>
      </div>

      {/* Main Engine Prompt Box */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 relative group">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-amber-400" />
            Active Prompt ({activeEngine.toUpperCase()} · Vertical 9:16)
          </span>

          <button
            onClick={() => handleCopy(getEnginePrompt(), 'main-prompt')}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
          >
            {copiedKey === 'main-prompt' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-black/50 p-3 rounded-lg border border-zinc-800/80 select-all">
          {getEnginePrompt()}
        </p>

        {/* Camera Trajectory & Physics Note */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">Camera Configuration:</span>
            <span className="text-zinc-300 font-mono">
              {currentShot.videoPrompts.cameraMotionConfig}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">Fabric Aerodynamics:</span>
            <span className="text-zinc-300 font-mono">
              {currentShot.sareeFabricPhysics}
            </span>
          </div>
        </div>
      </div>

      {/* Negative Prompt Defense Box */}
      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-semibold text-rose-300/90 text-xs">
            Universal Negative Prompt (Anti-Distortion & Consistency Lock)
          </span>
          <button
            onClick={() => handleCopy(UNIVERSAL_NEGATIVE_PROMPT, 'neg-prompt')}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            {copiedKey === 'neg-prompt' ? (
              <span className="text-emerald-400">Copied</span>
            ) : (
              <span>Copy</span>
            )}
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-zinc-800/60 select-all">
          {UNIVERSAL_NEGATIVE_PROMPT}
        </p>
      </div>
    </div>
  );
};

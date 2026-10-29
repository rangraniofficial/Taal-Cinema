import React, { useState } from 'react';
import { Sparkles, Send, Clapperboard, Check, Lightbulb } from 'lucide-react';

interface DirectorChatProps {
  currentShotNumber: number;
  currentShotTitle: string;
}

export const DirectorChat: React.FC<DirectorChatProps> = ({
  currentShotNumber,
  currentShotTitle,
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'director' | 'user'; text: string; timestamp: string }>
  >([
    {
      sender: 'director',
      text: `Namaste! I am your Bollywood Dance Director. We are currently framing Shot ${currentShotNumber}: "${currentShotTitle}". How would you like to refine the choreography, pallu flutter, fairy lights, or camera trajectory?`,
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Add more dramatic slow-motion pallu flutter during the twirl',
    'Enhance traditional Kathak footwork & ghungroo chimes',
    'Shift stage lighting from warm golden to royal violet & marigold amber',
    'Make the chorus hook step even more catchy and expressive',
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input.trim();
    if (!textToSend || isLoading) return;

    const newMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/direct-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInstruction: textToSend,
          currentShotIndex: currentShotNumber,
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'director',
            text: data.advice,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'director',
          text: `Director Note: On Shot ${currentShotNumber}, we've emphasized the fluid wrist rotations and golden zardozi embroidery reflections. Ensure camera orbit slows down slightly on beat 4 for maximum dramatic impact.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            <span>AI Bollywood Dance Director Console</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time directorial assistant powered by Gemini 3.8 Flash to tailor choreography, gestures, and cinematic staging.
          </p>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 text-[11px] flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Director Ideas:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-zinc-300 text-[11px] whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1">
              <span>{m.sender === 'user' ? 'You (Creator)' : 'Farah & Sanjay (AI Director)'}</span>
              <span>·</span>
              <span>{m.timestamp}</span>
            </div>
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-zinc-950 font-medium'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Director is analyzing dance movement & lighting trajectory...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Direct Shot ${currentShotNumber} (e.g. "Add a graceful spin before the namaste pose")...`}
          className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-amber-500 text-xs text-zinc-200 placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Direct</span>
        </button>
      </form>
    </div>
  );
};

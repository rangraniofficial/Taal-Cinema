/**
 * Web Audio API Bollywood Dance Sound Engine
 * Synthesizes authentic Dholak, Tabla, Ghungroo, and Sitar harmonics
 * Supports custom audio file upload, real-time beat detection, and frequency analysis.
 */

class BollywoodSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private tempo: number = 128; // BPM
  private currentBeat: number = 0;
  private timerId: number | null = null;
  private customAudioBuffer: AudioBuffer | null = null;
  private customAudioSource: AudioBufferSourceNode | null = null;
  private customAudioStartTime: number = 0;
  private customAudioOffset: number = 0;
  private customAudioDuration: number = 30;
  private isCustomMode: boolean = false;
  private volume: number = 0.85;

  private onBeatCallbacks: Array<(beat: number, isDownbeat: boolean) => void> = [];
  private onTimeUpdateCallbacks: Array<(time: number, duration: number) => void> = [];

  constructor() {
    // AudioContext will be lazily initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getBeatEnergy(): number {
    if (!this.analyser) return 0;
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    // Low bass frequencies for dholak punch (bins 0-8)
    let sum = 0;
    for (let i = 0; i < 8 && i < data.length; i++) {
      sum += data[i];
    }
    return sum / (8 * 255);
  }

  public subscribeBeat(cb: (beat: number, isDownbeat: boolean) => void) {
    this.onBeatCallbacks.push(cb);
    return () => {
      this.onBeatCallbacks = this.onBeatCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeTimeUpdate(cb: (time: number, duration: number) => void) {
    this.onTimeUpdateCallbacks.push(cb);
    return () => {
      this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setTempo(bpm: number) {
    this.tempo = Math.max(60, Math.min(200, bpm));
  }

  public getTempo(): number {
    return this.tempo;
  }

  // Synthesize Dholak Bass (Dagga)
  private playDholakBass(time: number, intensity: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency pitch slide characteristic of dholak bayan/dagga
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.14);

    gain.gain.setValueAtTime(0.7 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Synthesize Dholak Treble Snap (Chanti / Taali)
  private playDholakTreble(time: number, isRim: boolean = false) {
    if (!this.ctx || !this.masterGain) return;

    // Filtered noise for slap
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isRim ? 'highpass' : 'bandpass';
    filter.frequency.setValueAtTime(isRim ? 2400 : 1300, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isRim ? 0.4 : 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.08);

    // Tonal ring harmonic
    const tonal = this.ctx.createOscillator();
    const tonalGain = this.ctx.createGain();
    tonal.type = 'triangle';
    tonal.frequency.setValueAtTime(isRim ? 680 : 440, time);
    tonalGain.gain.setValueAtTime(0.2, time);
    tonalGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    tonal.connect(tonalGain);
    tonalGain.connect(this.masterGain);

    tonal.start(time);
    tonal.stop(time + 0.07);
  }

  // Synthesize Ghungroo (Ankle Bell Cluster)
  private playGhungroo(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [3100, 4800, 6200, 7900];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + idx * 80, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.13);
    });
  }

  // Synthesize Sitar / Tanpura Melodic Chord Accents
  private playSitarNote(time: number, noteFreq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteFreq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(noteFreq * 2.5, time);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.52);
  }

  // Pattern trigger for 8-step Bollywood cycle
  private triggerStep(stepIndex: number, time: number) {
    const isDownbeat = stepIndex % 8 === 0;

    // Sitar melodic progression based on Raag Yaman (Sa, Re, Ga, Ma#, Pa, Dha, Ni)
    const scale = [293.66, 329.63, 369.99, 415.3, 440.0, 493.88, 554.37, 587.33]; // D Major / Yaman
    const melodicNote = scale[stepIndex % scale.length];

    switch (stepIndex % 8) {
      case 0: // Dha (Heavy Bass + Treble + Ghungroo)
        this.playDholakBass(time, 1.2);
        this.playDholakTreble(time, false);
        this.playGhungroo(time);
        this.playSitarNote(time, melodicNote);
        break;
      case 1: // Ti (Light treble)
        this.playDholakTreble(time, true);
        break;
      case 2: // Dhin (Soft bass + treble)
        this.playDholakBass(time, 0.8);
        this.playDholakTreble(time, false);
        this.playGhungroo(time);
        break;
      case 3: // Ta (Treble snap)
        this.playDholakTreble(time, false);
        break;
      case 4: // Dha (Bass + Sitar accent)
        this.playDholakBass(time, 1.1);
        this.playDholakTreble(time, false);
        this.playGhungroo(time);
        this.playSitarNote(time, melodicNote);
        break;
      case 5: // Ti
        this.playDholakTreble(time, true);
        break;
      case 6: // Na (Resonant treble)
        this.playDholakTreble(time, false);
        this.playGhungroo(time);
        break;
      case 7: // Tin (Crisp finish before turnaround)
        this.playDholakTreble(time, true);
        break;
    }

    this.onBeatCallbacks.forEach((cb) => cb(stepIndex, isDownbeat));
  }

  // Load custom audio file (MP3 / WAV)
  public async loadCustomAudio(file: File): Promise<string> {
    this.initContext();
    if (!this.ctx) throw new Error('AudioContext not available');

    const arrayBuffer = await file.arrayBuffer();
    const decoded = await this.ctx.decodeAudioData(arrayBuffer);
    this.customAudioBuffer = decoded;
    this.customAudioDuration = decoded.duration;
    this.isCustomMode = true;

    return file.name;
  }

  public resetToPreset() {
    this.stop();
    this.isCustomMode = false;
    this.customAudioBuffer = null;
    this.customAudioOffset = 0;
  }

  public isUsingCustomAudio(): boolean {
    return this.isCustomMode;
  }

  // Playback control
  public play(startTimeSec: number = 0) {
    this.initContext();
    if (!this.ctx) return;
    this.stop();

    this.isPlaying = true;

    if (this.isCustomMode && this.customAudioBuffer) {
      this.customAudioSource = this.ctx.createBufferSource();
      this.customAudioSource.buffer = this.customAudioBuffer;
      this.customAudioSource.connect(this.masterGain!);

      const offset = Math.max(0, Math.min(startTimeSec, this.customAudioDuration));
      this.customAudioOffset = offset;
      this.customAudioStartTime = this.ctx.currentTime - offset;

      this.customAudioSource.start(0, offset);
      this.customAudioSource.onended = () => {
        if (this.isPlaying) {
          this.stop();
        }
      };

      // Periodic time & beat dispatch for custom audio
      const intervalMs = 100;
      this.timerId = window.setInterval(() => {
        if (!this.ctx || !this.isPlaying) return;
        const current = this.ctx.currentTime - this.customAudioStartTime;
        if (current >= this.customAudioDuration) {
          this.stop();
          return;
        }
        this.onTimeUpdateCallbacks.forEach((cb) => cb(current, this.customAudioDuration));

        // Beat pulse from energy
        const energy = this.getBeatEnergy();
        if (energy > 0.45) {
          this.onBeatCallbacks.forEach((cb) => cb(Math.floor(current * 2), true));
        }
      }, intervalMs);
    } else {
      // Synthesized Bollywood Groove
      const stepDuration = 60 / (this.tempo * 2); // 8th notes
      let currentTime = startTimeSec;
      const totalDuration = 30; // standard 30s reel

      const scheduleLoop = () => {
        if (!this.isPlaying || !this.ctx) return;

        const now = this.ctx.currentTime;
        this.triggerStep(this.currentBeat, now);
        this.currentBeat = (this.currentBeat + 1) % 64;

        currentTime += stepDuration;
        if (currentTime >= totalDuration) {
          currentTime = 0;
        }

        this.onTimeUpdateCallbacks.forEach((cb) => cb(currentTime, totalDuration));
      };

      this.timerId = window.setInterval(scheduleLoop, stepDuration * 1000);
      scheduleLoop();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.customAudioSource) {
      try {
        this.customAudioSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      this.customAudioSource = null;
    }
  }

  public togglePlay(currentTimeSec: number = 0) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(currentTimeSec);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new BollywoodSoundEngine();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private nodes: {
    [key: string]: {
      source: AudioNode;
      gainNode: GainNode;
      extra?: any; // For LFOs, secondary oscillators, or intervals to clean up
    };
  } = {};

  constructor() {
    // Lazy initialisation to prevent browser autoplay warnings
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  private resumeContext(): Promise<void> {
    this.init();
    if (!this.ctx) return Promise.reject("Audio API not supported in this browser");
    if (this.ctx.state === "suspended") {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  // 1. Synthesize Brown Noise (Fills deep relaxing frequencies, sounds like heavy rain/cascading waterfall)
  private createBrownNoiseNode(ctx: AudioContext): AudioNode {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Low-pass filter approximation for Brown Noise
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 4.0; // compensate for low-frequency loss
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  // Helper: Play a comforting constant bell chime
  public playChime(frequency: number = 528, duration: number = 1.5) {
    this.resumeContext().then(() => {
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Solfeggio 528Hz frequency is known as the "Transformation & Miracles" frequency
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    }).catch(err => console.warn("Audio Context launch deferred:", err));
  }

  // 2. Play soothing sounds
  public async startSound(id: string, initialVolume: number) {
    await this.resumeContext();
    const ctx = this.ctx;
    if (!ctx) return;

    // If the sound is already playing, stop it first to prevent duplicates
    if (this.nodes[id]) {
      this.stopSound(id);
    }

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth transition to target volume
    mainGain.gain.linearRampToValueAtTime(initialVolume, ctx.currentTime + 1.0);
    mainGain.connect(ctx.destination);

    if (id === "brown_noise") {
      const noise = this.createBrownNoiseNode(ctx) as AudioBufferSourceNode;
      noise.connect(mainGain);
      noise.start(0);

      this.nodes[id] = { source: noise, gainNode: mainGain };

    } else if (id === "ocean_waves") {
      // Ocean Waves are simulated by low-pass filtering Brown Noise and modulating volume with an LFO
      const noise = this.createBrownNoiseNode(ctx) as AudioBufferSourceNode;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      noise.connect(filter);
      filter.connect(mainGain);
      noise.start(0);

      // Create an LFO to modulate filter and minor volume for wave wash effect
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // Wave duration ~12 seconds cycle

      // Modulate volume
      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.4, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.3, ctx.currentTime); // sweep depth

      lfo.connect(lfoGain);
      lfoGain.connect(mainGain.gain); // apply waves overlay to gain
      lfo.start(0);

      this.nodes[id] = { 
        source: noise, 
        gainNode: mainGain,
        extra: { lfo, lfoGain }
      };

    } else if (id === "singing_bowl") {
      // Build a meditation bowl drone with Solfeggio 136.1Hz key (Om) and its natural harmonics
      const baseFreq = 136.1;
      const oscCount = 4;
      const oscillators: OscillatorNode[] = [];
      const harmonicGains: GainNode[] = [];

      const bowlGain = ctx.createGain();
      bowlGain.connect(mainGain);

      for (let i = 0; i < oscCount; i++) {
        const osc = ctx.createOscillator();
        const hGain = ctx.createGain();

        const harmonicMultiplier = i + 1;
        // Minor detuning to create a warm choral shimmering beat beat
        const detuneValue = i > 0 ? (Math.random() * 1.5 - 0.75) : 0;
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq * harmonicMultiplier, ctx.currentTime);
        if (detuneValue !== 0) {
          osc.detune.setValueAtTime(detuneValue * 100, ctx.currentTime);
        }

        // Higher harmonics are quieter
        const volumeFactor = 1 / (harmonicMultiplier * 1.5);
        hGain.gain.setValueAtTime(volumeFactor * 0.25, ctx.currentTime);

        // Slow minor tremolo on each harmonic
        const tremolo = ctx.createOscillator();
        tremolo.frequency.setValueAtTime(0.1 + Math.random() * 0.15, ctx.currentTime);
        const tremoloGain = ctx.createGain();
        tremoloGain.gain.setValueAtTime(0.08, ctx.currentTime);
        tremolo.connect(tremoloGain);
        tremoloGain.connect(hGain.gain);
        tremolo.start(0);

        osc.connect(hGain);
        hGain.connect(bowlGain);
        osc.start(0);

        oscillators.push(osc);
        harmonicGains.push(hGain);
      }

      this.nodes[id] = {
        source: bowlGain,
        gainNode: mainGain,
        extra: { oscillators }
      };

    } else if (id === "binaural_beats") {
      // Binaural Theta Beats: Left ear 148 Hz, Right ear 152 Hz. Beat frequency = 4Hz (Theta sleep/meditation wave)
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();

      oscLeft.type = "sine";
      oscLeft.frequency.setValueAtTime(148, ctx.currentTime);

      oscRight.type = "sine";
      oscRight.frequency.setValueAtTime(152, ctx.currentTime);

      const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
        pannerRight.pan.setValueAtTime(1, ctx.currentTime);

        oscLeft.connect(pannerLeft);
        pannerLeft.connect(mainGain);

        oscRight.connect(pannerRight);
        pannerRight.connect(mainGain);
      } else {
        // Fallback for browsers that don't support StereoPanner
        oscLeft.connect(mainGain);
        oscRight.connect(mainGain);
      }

      oscLeft.start(0);
      oscRight.start(0);

      this.nodes[id] = {
        source: mainGain,
        gainNode: mainGain,
        extra: { oscLeft, oscRight }
      };
    }
  }

  public setVolume(id: string, volume: number) {
    const node = this.nodes[id];
    if (node && this.ctx) {
      node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, this.ctx.currentTime);
      node.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
    }
  }

  public stopSound(id: string) {
    const node = this.nodes[id];
    if (!node) return;

    const ctx = this.ctx;
    if (ctx) {
      // Smooth fade out to avoid clicks
      node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, ctx.currentTime);
      node.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      
      setTimeout(() => {
        try {
          if (id === "brown_noise" || id === "ocean_waves") {
            (node.source as AudioBufferSourceNode).stop();
          }
          if (node.extra) {
            if (node.extra.lfo) node.extra.lfo.stop();
            if (node.extra.oscillators) {
              node.extra.oscillators.forEach((osc: OscillatorNode) => osc.stop());
            }
            if (node.extra.oscLeft) node.extra.oscLeft.stop();
            if (node.extra.oscRight) node.extra.oscRight.stop();
          }
        } catch (e) {
          // Keep failure clean
        }
        delete this.nodes[id];
      }, 600);
    } else {
      delete this.nodes[id];
    }
  }

  public stopAll() {
    Object.keys(this.nodes).forEach((id) => {
      this.stopSound(id);
    });
  }

  public getActiveSounds() {
    return Object.keys(this.nodes);
  }
}

export const AudioEngine = new AudioEngineClass();

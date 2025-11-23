
// SoundService using Web Audio API to synthesize sounds without external assets

class SoundService {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioScheduledSourceNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy init on first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  // --- Private Helpers ---

  private createMechanicalClick(startTime: number, frequency: number = 1200, volume: number = 0.1) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    // Triangle wave gives a crisp but not too harsh sound
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(frequency, startTime);
    // Rapid pitch drop simulates a physical switch mechanism
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, startTime + 0.03);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    
    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }

  // --- SFX Methods ---

  // Standard UI Interaction (Buttons, Selectors)
  // Crisp, short, mechanical click
  public playClick() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // High pitch, crisp snap
    this.createMechanicalClick(now, 1500, 0.15);
  }

  // "Click" for Upload Button
  // Ordinary click with slight mechanical feel
  public playUploadClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Standard click frequency, slightly softer
    this.createMechanicalClick(now, 1000, 0.2);
  }

  // Hover sound - Lighter, higher mechanical tick
  public playPop() {
     this.init();
     if (!this.ctx) return;
     
     const now = this.ctx.currentTime;
     // Lighter volume, higher pitch, very short
     this.createMechanicalClick(now, 2000, 0.03);
  }

  public playShutter() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    // Mechanical Click (Shutter Leaf)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle'; 
    // Raised frequency from 150 to 800 to remove "peng" (thud) and make it a crisp mechanical snap
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);

    // Flash / Air sound (Noise burst) - Reduced volume to keep it clean
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    // Reduced gain slightly
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    source.start();
    source.stop(this.ctx.currentTime + 0.15);
  }

  // Simulated Polaroid Ejection 
  // 1. Click (Mechanical Start)
  // 2. Motor Whirr (Sawtooth + LPF)
  // 3. Paper Hiss (White Noise + HPF)
  // 4. Exit Whoosh (Noise + Fade)
  public playPrint() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    const t = this.ctx.currentTime;
    const motorDuration = 1.2; 

    // 1. Mechanical Start (Click)
    const startOsc = this.ctx.createOscillator();
    const startGain = this.ctx.createGain();
    startOsc.type = 'square';
    startOsc.frequency.setValueAtTime(600, t);
    startOsc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    
    startGain.gain.setValueAtTime(0.2, t);
    startGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    startOsc.connect(startGain);
    startGain.connect(this.ctx.destination);
    startOsc.start(t);
    startOsc.stop(t + 0.06);

    // 2. Motor Whirr (Sawtooth + Lowpass)
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    const motorFilter = this.ctx.createBiquadFilter();

    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(120, t); 
    // Slight frequency drop to simulate load
    motorOsc.frequency.linearRampToValueAtTime(110, t + motorDuration);

    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 400; // Muffle the sawtooth buzzing

    motorGain.gain.setValueAtTime(0, t);
    motorGain.gain.linearRampToValueAtTime(0.12, t + 0.1); // Attack
    motorGain.gain.setValueAtTime(0.12, t + motorDuration - 0.1); // Sustain
    motorGain.gain.linearRampToValueAtTime(0, t + motorDuration); // Release

    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.ctx.destination);
    motorOsc.start(t);
    motorOsc.stop(t + motorDuration);

    // 3. Paper Friction (Highpass Noise)
    const frictionSrc = this.ctx.createBufferSource();
    frictionSrc.buffer = this.noiseBuffer;
    const frictionFilter = this.ctx.createBiquadFilter();
    const frictionGain = this.ctx.createGain();

    frictionFilter.type = 'highpass';
    frictionFilter.frequency.value = 2500; // Just the high hiss

    frictionGain.gain.setValueAtTime(0, t);
    frictionGain.gain.linearRampToValueAtTime(0.08, t + 0.1);
    frictionGain.gain.setValueAtTime(0.08, t + motorDuration - 0.1);
    frictionGain.gain.linearRampToValueAtTime(0, t + motorDuration);

    frictionSrc.connect(frictionFilter);
    frictionFilter.connect(frictionGain);
    frictionGain.connect(this.ctx.destination);
    frictionSrc.start(t);
    frictionSrc.stop(t + motorDuration);

    // 4. Exit Whoosh (Lowpass Noise Fade Out)
    const exitSrc = this.ctx.createBufferSource();
    exitSrc.buffer = this.noiseBuffer;
    const exitFilter = this.ctx.createBiquadFilter();
    const exitGain = this.ctx.createGain();
    
    const exitStart = t + motorDuration - 0.2; // Overlap slightly
    
    exitFilter.type = 'lowpass';
    exitFilter.frequency.setValueAtTime(800, exitStart);
    exitFilter.frequency.linearRampToValueAtTime(100, exitStart + 0.4);

    exitGain.gain.setValueAtTime(0, exitStart);
    exitGain.gain.linearRampToValueAtTime(0.15, exitStart + 0.1);
    exitGain.gain.linearRampToValueAtTime(0, exitStart + 0.4);

    exitSrc.connect(exitFilter);
    exitFilter.connect(exitGain);
    exitGain.connect(this.ctx.destination);
    exitSrc.start(exitStart);
    exitSrc.stop(exitStart + 0.5);
  }

  public playDing() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Bell-like overtones (simple simulation with sine)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
  }

  // --- Ambient BGM ---
  // Generative ambient music: random pentatonic notes
  
  public startBGM() {
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.15; // Low volume
    this.bgmGain.connect(this.ctx.destination);

    this.scheduleNextNote();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmGain) {
        const now = this.ctx?.currentTime || 0;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.linearRampToValueAtTime(0, now + 2); // Fade out
        setTimeout(() => {
            this.bgmGain?.disconnect();
            this.bgmGain = null;
        }, 2000);
    }
    this.bgmNodes.forEach(node => {
        try { node.stop(); } catch(e) {}
    });
    this.bgmNodes = [];
  }

  private scheduleNextNote() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    // Simple C Major Pentatonic: C4, D4, E4, G4, A4
    const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; 
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(this.bgmGain);
    
    const now = this.ctx.currentTime;
    const duration = 2 + Math.random() * 2;
    
    // Soft attack and release
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
    
    this.bgmNodes.push(osc);
    
    // Schedule next note
    const nextTime = Math.random() * 1000 + 500; // 0.5 to 1.5 seconds
    setTimeout(() => this.scheduleNextNote(), nextTime);
    
    // Cleanup old nodes roughly
    if (this.bgmNodes.length > 10) {
        this.bgmNodes.shift(); 
    }
  }
}

export const soundService = new SoundService();

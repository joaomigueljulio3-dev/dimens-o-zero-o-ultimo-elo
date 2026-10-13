// DIMENSÃO ZERO - Audio Engine (Procedural Web Audio API)
// Provides 100% offline, zero-asset cosmic Sci-Fi music and dynamic SFX!

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.bgmNode = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.bgmVolume = 0.6;
    this.sfxVolume = 0.8;
    this.currentTrack = 'ambient';
    this.isPlayingBGM = false;
    this.tempoInterval = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  resume() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  playSlash() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playImpact() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Low punch thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  playSkillPulse() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Deep dimensional blast
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

    gain.gain.setValueAtTime(this.sfxVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.51);
  }

  playSkillPhoton() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    // High piercing energy laser
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.35);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playSkillTimeRift() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Cosmic warp modulation
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.2);
    osc.frequency.linearRampToValueAtTime(500, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.7);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.71);
  }

  playDodge() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playJump() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.14);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playLevelUp() {
    if (!this.ctx) return;
    this.resume();
    const notes = [261.6, 329.6, 392.0, 523.3, 659.3]; // C E G C E
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.31);
    });
  }

  playChest() {
    if (!this.ctx) return;
    this.resume();
    const notes = [440, 554, 659, 880];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.2, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.26);
    });
  }

  playBlip() {
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- Procedural Cosmic BGM Tracks ---
  playMusic(type = 'ambient') {
    this.currentTrack = type;
    if (!this.ctx) return;
    this.resume();
    this.stopMusic();
    this.isPlayingBGM = true;

    // Ambient Drone layer
    const droneOsc1 = this.ctx.createOscillator();
    const droneOsc2 = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    const droneFilter = this.ctx.createBiquadFilter();

    let rootFreq = 65.4; // C2
    if (type === 'combat') rootFreq = 73.4; // D2
    if (type === 'boss') rootFreq = 55.0; // A1

    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(rootFreq, this.ctx.currentTime);

    droneOsc2.type = 'sine';
    droneOsc2.frequency.setValueAtTime(rootFreq * 1.5, this.ctx.currentTime); // 5th

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(type === 'boss' ? 400 : 250, this.ctx.currentTime);

    droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.bgmGain);

    droneOsc1.start();
    droneOsc2.start();

    this.activeNodes = [droneOsc1, droneOsc2, droneGain];

    // Procedural Arp / Pulse pattern
    let step = 0;
    const scale = type === 'boss' 
      ? [110, 116.5, 130.8, 146.8, 155.6, 174.6] // Phrygian dark
      : type === 'combat' 
      ? [146.8, 164.8, 174.6, 220.0, 261.6, 293.6] // Dorian driving
      : [130.8, 164.8, 196.0, 246.9, 261.6, 329.6]; // Lydian cosmic

    const intervalMs = type === 'boss' ? 220 : type === 'combat' ? 280 : 500;

    this.tempoInterval = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx) return;
      const noteFreq = scale[step % scale.length];
      const t = this.ctx.currentTime;

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = type === 'ambient' ? 'sine' : 'triangle';
      arpOsc.frequency.setValueAtTime(noteFreq * (Math.random() > 0.6 ? 2 : 1), t);

      arpGain.gain.setValueAtTime(type === 'boss' ? 0.08 : 0.05, t);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, t + (intervalMs / 1000) * 0.9);

      arpOsc.connect(arpGain);
      arpGain.connect(this.bgmGain);

      arpOsc.start(t);
      arpOsc.stop(t + (intervalMs / 1000));

      // Bass pulse on boss/combat
      if ((type === 'boss' || type === 'combat') && step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(90, t);
        kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.18);
        kickGain.gain.setValueAtTime(0.2, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.19);
      }

      step++;
    }, intervalMs);
  }

  stopMusic() {
    this.isPlayingBGM = false;
    if (this.tempoInterval) {
      clearInterval(this.tempoInterval);
      this.tempoInterval = null;
    }
    if (this.activeNodes) {
      this.activeNodes.forEach(node => {
        try { if (node.stop) node.stop(); } catch (e) {}
      });
      this.activeNodes = [];
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }
}

window.audioEngine = new AudioEngine();

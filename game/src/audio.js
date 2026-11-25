// Dapur Kilat — sounds, synthesized with WebAudio. No audio files, no network:
// every effect is a short oscillator or noise burst built at run time.

/** A tiny synth bank. All methods are safe to call before any user gesture; the
 *  context is created lazily on the first sound, and muted means silent. */
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  ensure() {
    if (this.context === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      const resumed = this.context.resume();
      if (resumed && typeof resumed.catch === 'function') resumed.catch(() => {});
    }
    return this.context;
  }

  tone(frequency, duration, type, volume, when) {
    if (this.muted) return;
    const context = this.ensure();
    if (context === null) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.value = frequency;
    const start = context.currentTime + (when || 0);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume || 0.12, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  /** A chopping click when an ingredient lands on the plate. */
  chop() {
    this.tone(520, 0.07, 'square', 0.06);
    this.tone(780, 0.05, 'square', 0.04, 0.04);
  }

  /** Two-note ding for a served dish. */
  ding() {
    this.tone(880, 0.12, 'sine', 0.14);
    this.tone(1318, 0.18, 'sine', 0.12, 0.1);
  }

  /** Low buzz for a plate that matches nothing. */
  buzz() {
    this.tone(160, 0.22, 'sawtooth', 0.1);
  }

  /** Short tick when a ticket is about to expire. */
  tick() {
    this.tone(1200, 0.05, 'sine', 0.05);
  }

  /** Little jingle for the end of a shift. */
  jingle(win) {
    const notes = win ? [523, 659, 784, 1046] : [392, 330, 262, 196];
    notes.forEach((frequency, index) => this.tone(frequency, 0.16, 'triangle', 0.12, index * 0.13));
  }
}

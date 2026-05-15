let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

async function ensureAudioReady() {
  const ctx = getAudioContext();
  if (!ctx) {
    return null;
  }

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }

  return ctx;
}

function playTone(ctx, { frequency, duration = 140, type = "sine", gain = 0.06, when = 0 }) {
  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + when);

  envelope.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  envelope.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + when + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + duration / 1000);

  oscillator.connect(envelope);
  envelope.connect(ctx.destination);
  oscillator.start(ctx.currentTime + when);
  oscillator.stop(ctx.currentTime + when + duration / 1000 + 0.02);
}

export async function playSuccessSound() {
  const ctx = await ensureAudioReady();
  if (!ctx) {
    return;
  }

  playTone(ctx, { frequency: 523.25, type: "triangle", gain: 0.05, duration: 110 });
  playTone(ctx, { frequency: 659.25, type: "triangle", gain: 0.055, duration: 120, when: 0.12 });
  playTone(ctx, { frequency: 783.99, type: "triangle", gain: 0.06, duration: 160, when: 0.24 });
}

export async function playLoginSound() {
  const ctx = await ensureAudioReady();
  if (!ctx) {
    return;
  }

  // Ascending welcome fanfare: Do-Mi-Sol-Do (C major arpeggio + octave)
  playTone(ctx, { frequency: 523.25, type: "triangle", gain: 0.06, duration: 100 });
  playTone(ctx, { frequency: 659.25, type: "triangle", gain: 0.065, duration: 100, when: 0.11 });
  playTone(ctx, { frequency: 783.99, type: "triangle", gain: 0.07, duration: 100, when: 0.22 });
  playTone(ctx, { frequency: 1046.5, type: "triangle", gain: 0.08, duration: 300, when: 0.33 });
  // Warm chord underneath for fullness
  playTone(ctx, { frequency: 261.63, type: "sine", gain: 0.04, duration: 600, when: 0.33 });
  playTone(ctx, { frequency: 392.0, type: "sine", gain: 0.035, duration: 600, when: 0.33 });
}

export async function playCrashSound() {
  const ctx = await ensureAudioReady();
  if (!ctx) {
    return;
  }

  playTone(ctx, { frequency: 160, type: "sawtooth", gain: 0.08, duration: 140 });
  playTone(ctx, { frequency: 120, type: "square", gain: 0.07, duration: 180, when: 0.12 });
  playTone(ctx, { frequency: 72, type: "square", gain: 0.06, duration: 240, when: 0.26 });
}

export async function playWarningSound() {
  const ctx = await ensureAudioReady();
  if (!ctx) {
    return;
  }

  playTone(ctx, { frequency: 392, type: "triangle", gain: 0.05, duration: 120 });
  playTone(ctx, { frequency: 294, type: "triangle", gain: 0.05, duration: 140, when: 0.12 });
}

type OscType = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let intensity = 0;
let intensityTarget = 0;

let masterVol = 0.8;
let musicVol = 0.5;
let sfxVol = 0.8;

const lastPlay: Record<string, number> = {};

export function setVolumes(masterV: number, musicV: number, sfxV: number) {
  masterVol = masterV;
  musicVol = musicV;
  sfxVol = sfxV;
  if (!ctx || !master || !musicBus || !sfxBus) return;
  master.gain.value = masterVol;
  musicBus.gain.value = musicVol * 0.5;
  sfxBus.gain.value = sfxVol;
}

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = masterVol;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = musicVol * 0.5;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = sfxVol;
    sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    startMusic();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function gate(key: string, ms: number): boolean {
  const now = performance.now();
  if (now - (lastPlay[key] ?? 0) < ms) return false;
  lastPlay[key] = now;
  return true;
}

function tone(opts: {
  freq: number;
  freqEnd?: number;
  type?: OscType;
  dur?: number;
  vol?: number;
  delay?: number;
  bus?: GainNode | null;
}) {
  if (!ctx || !sfxBus) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? "square";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), t0 + (opts.dur ?? 0.15));
  g.gain.setValueAtTime(opts.vol ?? 0.25, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + (opts.dur ?? 0.15));
  osc.connect(g);
  g.connect(opts.bus ?? sfxBus);
  osc.start(t0);
  osc.stop(t0 + (opts.dur ?? 0.15) + 0.02);
}

function noise(opts: { dur?: number; vol?: number; delay?: number; lowpass?: number; bus?: GainNode | null }) {
  if (!ctx || !sfxBus || !noiseBuf) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + (opts.dur ?? 0.2));
  if (opts.lowpass) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = opts.lowpass;
    src.connect(f);
    f.connect(g);
  } else {
    src.connect(g);
  }
  g.connect(opts.bus ?? sfxBus);
  src.start(t0);
  src.stop(t0 + (opts.dur ?? 0.2) + 0.02);
}

export const sfx = {
  shoot() {
    if (!gate("shoot", 60)) return;
    tone({ freq: 880, freqEnd: 220, type: "square", dur: 0.12, vol: 0.12 });
  },
  melee() {
    if (!gate("melee", 80)) return;
    noise({ dur: 0.1, vol: 0.2, lowpass: 3000 });
    tone({ freq: 300, freqEnd: 90, type: "sawtooth", dur: 0.1, vol: 0.14 });
  },
  hit(crit: boolean) {
    if (!gate("hit", 50)) return;
    tone({ freq: crit ? 320 : 220, freqEnd: 80, type: "square", dur: 0.1, vol: crit ? 0.28 : 0.16 });
    if (crit) tone({ freq: 1200, freqEnd: 2400, type: "sine", dur: 0.12, vol: 0.12, delay: 0.02 });
  },
  explode() {
    if (!gate("explode", 120)) return;
    noise({ dur: 0.35, vol: 0.35, lowpass: 1200 });
    tone({ freq: 160, freqEnd: 40, type: "sawtooth", dur: 0.35, vol: 0.25 });
  },
  pickup() {
    if (!gate("pickup", 90)) return;
    tone({ freq: 660, type: "sine", dur: 0.08, vol: 0.18 });
    tone({ freq: 990, type: "sine", dur: 0.1, vol: 0.18, delay: 0.07 });
  },
  gold() {
    if (!gate("gold", 120)) return;
    tone({ freq: 1320, type: "sine", dur: 0.07, vol: 0.12 });
    tone({ freq: 1760, type: "sine", dur: 0.09, vol: 0.1, delay: 0.05 });
  },
  hurt() {
    if (!gate("hurt", 200)) return;
    tone({ freq: 140, freqEnd: 60, type: "sawtooth", dur: 0.25, vol: 0.3 });
  },
  levelup() {
    tone({ freq: 523, type: "square", dur: 0.12, vol: 0.16 });
    tone({ freq: 659, type: "square", dur: 0.12, vol: 0.16, delay: 0.1 });
    tone({ freq: 784, type: "square", dur: 0.12, vol: 0.16, delay: 0.2 });
    tone({ freq: 1046, type: "square", dur: 0.22, vol: 0.18, delay: 0.3 });
  },
  click() {
    if (!gate("click", 40)) return;
    tone({ freq: 700, freqEnd: 500, type: "square", dur: 0.05, vol: 0.1 });
  },
  roar() {
    tone({ freq: 90, freqEnd: 45, type: "sawtooth", dur: 0.7, vol: 0.35 });
    noise({ dur: 0.6, vol: 0.2, lowpass: 600 });
  },
  quest() {
    tone({ freq: 784, type: "sine", dur: 0.15, vol: 0.2 });
    tone({ freq: 1175, type: "sine", dur: 0.25, vol: 0.2, delay: 0.12 });
  },
  forge() {
    tone({ freq: 1567, freqEnd: 800, type: "triangle", dur: 0.2, vol: 0.2 });
    noise({ dur: 0.12, vol: 0.15, lowpass: 5000 });
    tone({ freq: 2093, type: "triangle", dur: 0.25, vol: 0.15, delay: 0.1 });
  },
  dodge() {
    if (!gate("dodge", 150)) return;
    noise({ dur: 0.12, vol: 0.1, lowpass: 2000 });
  },
};

const ROOTS = [110, 87.31, 130.81, 98];
const ARP = [220, 261.63, 329.63, 261.63, 293.66, 349.23, 440, 349.23];

function startMusic() {
  if (musicTimer || !ctx || !musicBus) return;
  musicTimer = setInterval(() => {
    if (!ctx || !musicBus) return;
    if (ctx.state !== "running") return;
    intensity += (intensityTarget - intensity) * 0.1;
    const combat = intensity > 0.4;
    const beat = combat ? 0.21 : 0.42;
    void beat;
    const s = step++;
    const bar = Math.floor(s / 8) % 4;
    const root = ROOTS[bar];
    if (s % (combat ? 2 : 4) === 0) {
      tone({ freq: root, type: "triangle", dur: combat ? 0.3 : 0.6, vol: 0.22, bus: musicBus });
      tone({ freq: root * 1.5, type: "sine", dur: combat ? 0.3 : 0.6, vol: 0.1, bus: musicBus });
    }
    if (combat && s % 2 === 1) {
      tone({ freq: ARP[s % ARP.length] * 2, type: "sine", dur: 0.12, vol: 0.07, bus: musicBus });
    }
    if (!combat && s % 8 === 4) {
      tone({ freq: ARP[(s + bar) % ARP.length], type: "sine", dur: 0.5, vol: 0.08, bus: musicBus });
    }
    if (combat && s % 4 === 2) {
      noise({ dur: 0.05, vol: 0.05, lowpass: 8000, bus: musicBus });
    }
  }, 210);
}

export function setCombatMusic(inCombat: boolean) {
  intensityTarget = inCombat ? 1 : 0;
}

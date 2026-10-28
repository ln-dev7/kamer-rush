import {
  VoiceDirector,
  approvedLocalAudio,
  type AudioCatalog,
  type VoiceContext,
  type MusicTrack,
} from "./voice-director";
export class AudioManager {
  enabled = false;
  subtitles = true;
  currentText: string | null = null;
  master = 0.65;
  musicVolume = 0.32;
  voiceVolume = 0.8;
  effects = 0.5;
  paused = false;
  clock = 0;
  catalog: AudioCatalog = {
    musicStatus: "Chargement du catalogue…",
    voiceStatus: "Chargement du catalogue…",
    tracks: [],
    lines: [],
    dialogueProvenance: { kind: "", sources: [] },
  };
  readonly ready: Promise<void>;
  private director = new VoiceDirector([]);
  private context: AudioContext | undefined;
  private engine: OscillatorNode | undefined;
  private engineGain: GainNode | undefined;
  private music = new Audio();
  private voice = new Audio();
  private selected: string | null = null;
  onSubtitle?: (text: string | null, audioAvailable: boolean) => void;
  onStatus?: () => void;
  constructor(private base: string) {
    this.voice.id = "voice-playback";
    this.music.id = "music-playback";
    for (const element of [this.voice, this.music]) {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
      document.body.append(element);
    }
    this.music.loop = true;
    this.music.preload = "none";
    this.voice.preload = "none";
    this.ready = fetch(
      base +
        (import.meta.env.VITE_LOCAL_AUDIO === "1"
          ? "audio/catalog.local.json"
          : "audio/catalog.json"),
    )
      .then((r) => {
        if (!r.ok) throw new Error("catalog");
        return r.json();
      })
      .then((c: AudioCatalog) => {
        this.catalog = c;
        this.director.lines = c.lines;
        this.onStatus?.();
      })
      .catch(() => {
        this.catalog.musicStatus = "Catalogue audio indisponible.";
        this.catalog.voiceStatus =
          "Les effets synthétiques restent disponibles.";
        this.onStatus?.();
      });
    this.voice.onended = () => this.mix();
  }
  async unlock() {
    if (!this.context) {
      this.context = new AudioContext();
      this.engine = this.context.createOscillator();
      this.engineGain = this.context.createGain();
      this.engine.type = "triangle";
      this.engine.frequency.value = 45;
      this.engineGain.gain.value = 0;
      this.engine.connect(this.engineGain).connect(this.context.destination);
      this.engine.start();
    }
    await this.context.resume();
  }
  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      try {
        await this.unlock();
        if (!this.paused && this.selected) this.music.play().catch(() => {});
      } catch {
        this.enabled = false;
      }
    }
    if (!this.enabled) {
      this.music.pause();
      this.voice.pause();
    }
    this.mix();
    this.onStatus?.();
  }
  setPaused(value: boolean) {
    this.paused = value;
    if (value) {
      this.music.pause();
      this.voice.pause();
    } else if (this.enabled) {
      if (this.selected) this.music.play().catch(() => {});
      if (
        this.director.active &&
        this.clock < this.director.active.until &&
        this.voice.src
      )
        this.voice.play().catch(() => {});
    }
    this.mix();
  }
  chooseTrack(id: string) {
    const track = this.catalog.tracks.find(
      (t) => t.id === id && approvedLocalAudio(t.file, t.license, "music"),
    );
    if (!track) return false;
    this.selected = id;
    this.music.src = this.base + track.file;
    if (this.enabled && !this.paused) this.music.play().catch(() => {});
    this.mix();
    return true;
  }
  trigger(event: string, context: VoiceContext = {}) {
    if (this.paused || (!this.subtitles && !this.enabled)) return;
    const item = this.director.request(event, this.clock, context);
    if (!item) return;
    this.voice.pause();
    this.voice.removeAttribute("src");
    const playable = approvedLocalAudio(
      item.line.file,
      item.line.license,
      "voices",
    );
    this.currentText = item.line.text;
    this.onSubtitle?.(this.subtitles ? item.line.text : null, playable);
    if (playable && this.enabled && this.voiceVolume > 0) {
      this.voice.src = this.base + item.line.file;
      this.voice.play().catch(() => {});
    }
    this.mix();
  }
  tick(dt: number, speed: number, engineActive: boolean) {
    if (!this.paused) this.clock += dt;
    if (this.director.active && this.clock >= this.director.active.until) {
      this.director.clear();
      this.currentText = null;
      this.onSubtitle?.(null, false);
    }
    if (this.context && this.engine && this.engineGain) {
      this.engine.frequency.setTargetAtTime(
        42 + Math.abs(speed) * 4.8,
        this.context.currentTime,
        0.1,
      );
      this.engineGain.gain.setTargetAtTime(
        this.enabled && !this.paused && engineActive
          ? this.master * this.effects * (0.02 + Math.abs(speed) * 0.0009)
          : 0,
        this.context.currentTime,
        0.08,
      );
    }
    this.mix();
  }
  beep(frequency = 600, duration = 0.12) {
    if (!this.enabled || this.paused || !this.context) return;
    const o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.setValueAtTime(
      this.master * this.effects * 0.09,
      this.context.currentTime,
    );
    g.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + duration,
    );
    o.connect(g).connect(this.context.destination);
    o.start();
    o.stop(this.context.currentTime + duration);
  }
  horn() {
    this.beep(420, 0.18);
    setTimeout(() => this.beep(340, 0.14), 110);
  }
  stopDialogue() {
    this.voice.pause();
    this.voice.removeAttribute("src");
    this.director.clear();
    this.currentText = null;
    this.onSubtitle?.(null, false);
  }
  get approvedTracks() {
    return this.catalog.tracks.filter((t) =>
      approvedLocalAudio(t.file, t.license, "music"),
    );
  }
  private mix() {
    const speaking = !!this.director.active;
    this.music.volume = Math.max(
      0,
      Math.min(
        1,
        this.enabled
          ? this.master * this.musicVolume * (speaking ? 0.25 : 1)
          : 0,
      ),
    );
    this.voice.volume = Math.max(
      0,
      Math.min(1, this.enabled ? this.master * this.voiceVolume : 0),
    );
  }
}

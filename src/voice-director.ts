export type Rights = {
  status: string;
  type: string | null;
  source: string | null;
};
export type VoiceLine = {
  id: string;
  text: string;
  context: string;
  voice: string | null;
  trigger: string | null;
  conditions: string[];
  cooldown: number;
  priority: number;
  mechanicStatus: string;
  audioStatus: string;
  duration?: number;
  file: string | null;
  license: Rights;
};
export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  file: string;
  source: string;
  license: Rights;
  modifications?: string;
};
export type AudioCatalog = {
  musicStatus: string;
  voiceStatus: string;
  tracks: MusicTrack[];
  lines: VoiceLine[];
  dialogueProvenance: { kind: string; sources: string[] };
};
export type VoiceContext = Record<string, boolean>;
export function approvedLocalAudio(
  file: string | null,
  rights: Rights,
  kind: "voices" | "music",
) {
  return (
    !!file &&
    rights.status === "approved" &&
    file.startsWith(`audio/${kind}/`) &&
    !file.includes("..") &&
    !file.includes("://")
  );
}
export class VoiceDirector {
  private used = new Map<string, number>();
  private recent: string[] = [];
  private lastAt = -100;
  active: { line: VoiceLine; until: number } | null = null;
  constructor(public lines: VoiceLine[]) {}
  request(trigger: string, time: number, context: VoiceContext = {}) {
    const candidates = this.lines.filter(
      (l) =>
        l.mechanicStatus === "implemented" &&
        l.trigger === trigger &&
        l.conditions.every((c) => !!context[c]) &&
        time - (this.used.get(l.id) ?? -1000) >= l.cooldown,
    );
    if (!candidates.length) return null;
    const fresh = candidates.filter(
      (l) => !this.recent.slice(-2).includes(l.id),
    );
    const pool = fresh.length ? fresh : candidates;
    pool.sort((a, b) => b.priority - a.priority);
    const line = pool[0];
    if (time - this.lastAt < 2.5) return null;
    if (
      this.active &&
      time < this.active.until &&
      line.priority <= this.active.line.priority
    )
      return null;
    const duration = Math.max(
      2.4,
      (line.duration || line.text.split(" ").length / 3 + 1) + 0.3,
    );
    this.active = { line, until: time + duration };
    this.used.set(line.id, time);
    this.recent.push(line.id);
    this.recent = this.recent.slice(-5);
    this.lastAt = time;
    return this.active;
  }
  clear() {
    this.active = null;
  }
}

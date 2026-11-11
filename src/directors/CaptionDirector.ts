import type { VideoSpec } from "../schemas/video";
export type CaptionPhrase = {
  text: string;
  startMs: number;
  durationMs: number;
  tokens: { text: string; fromMs: number; toMs: number }[];
};
/** Break at punctuation, pauses and clause starts; never join separate sentences. */
export function phrases(words: VideoSpec["words"]): CaptionPhrase[] {
  const chunks: VideoSpec["words"][] = [];
  let group: VideoSpec["words"] = [];
  const flush = () => {
    if (group.length) chunks.push(group);
    group = [];
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = words[i - 1];
    const clause = /^(then|but|and|with|into|because)$/i.test(w.text);
    if (
      group.length &&
      (group.length >= 5 ||
        (group.length >= 2 && clause) ||
        (prev && w.start - prev.end > 0.28))
    )
      flush();
    group.push(w);
    if (/[.!?:;,]$/.test(w.text)) flush();
  }
  flush();
  // Avoid isolated final articles caused by a length split, without crossing punctuation.
  for (let i = 0; i < chunks.length - 1; i++) {
    const g = chunks[i];
    if (g.length > 2 && /^(a|the|to|of|for|is)$/i.test(g.at(-1)!.text)) {
      chunks[i + 1].unshift(g.pop()!);
    }
  }
  // Moving a trailing article can make the following group exceed five words.
  // Rebalance it without losing words or crossing sentence boundaries.
  const bounded = chunks.flatMap((original) => {
    const remaining = [...original];
    const result: typeof chunks = [];
    while (remaining.length > 5) {
      let cut = remaining.length === 6 ? 4 : 5;
      if (/^(a|the|to|of|for|is)$/i.test(remaining[cut - 1].text)) cut--;
      result.push(remaining.splice(0, cut));
    }
    if (remaining.length) result.push(remaining);
    return result;
  });
  return bounded.map((ws) => ({
    text: ws.map((w) => w.text).join(" "),
    startMs: ws[0].start * 1000,
    durationMs: (ws.at(-1)!.end - ws[0].start) * 1000,
    tokens: ws.map((w, j) => ({
      text: (j ? " " : "") + w.text,
      fromMs: w.start * 1000,
      toMs: w.end * 1000,
    })),
  }));
}
const stamp = (s: number) =>
  new Date(Math.round(s * 1000)).toISOString().slice(11, 23).replace(".", ",");
export function srt(words: VideoSpec["words"]) {
  return phrases(words)
    .map(
      (p, i) =>
        `${i + 1}\n${stamp(p.startMs / 1000)} --> ${stamp((p.startMs + p.durationMs) / 1000)}\n${p.text}\n`,
    )
    .join("\n");
}
export const captionAreas = {
  bottom: { x: 85, y: 1480, width: 800, height: 190 },
  top: { x: 85, y: 160, width: 800, height: 190 },
};

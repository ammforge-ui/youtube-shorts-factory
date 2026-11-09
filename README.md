# YouTube Shorts Factory

A local, JSON-driven TypeScript/React/Remotion production foundation. The first topic records the **actual official CyberChef v11.5.0 release**, served locally because hosted demonstration sites are blocked in this environment. It is not fixture footage.

## Run

Requires Node 24, Python 3.12, Chromium, FFmpeg/ffprobe, gcc/g++, unzip and curl. No API keys, paid service, GPU, Docker or YouTube credentials are needed.

```bash
cd /workspace/youtube-shorts-factory
bash scripts/setup.sh
npm run test:pipeline
npm run verify
npm run export
```

The test captures desktop and mobile interactions, asserts a Base64 decode, generates local English neural speech, aligns all words to audio, mixes original sound cues, renders one vertical MP4, extracts review frames, checks codecs/audio/duration/gaps, and writes metadata/history. `--reuse` reuses existing capture/narration to iterate on visuals:

```bash
npm run test:pipeline -- --reuse
npm run studio
npx tsx scripts/check-invariants.ts
npx tsx scripts/inspect-templates.ts
```

`output/test-run/final.mp4` is the finished video. `npm run export` packages it and all requested deliverables into `artifacts/test-run.tar.gz`, plus a dependency-free source archive at `artifacts/source.tar.gz`. Use the task file browser's download action where available, or copy the archive from the workspace using your connected workspace file-transfer facility. Generated outputs are ignored by default. The reviewed first test video and reports are explicitly tracked under output/test-run. On GitHub, open output/test-run/final.mp4 and choose Download raw file to save the video. Raw recordings and other generated media remain excluded. This environment does not expose a dedicated artifact-upload tool.

For Studio, first run the pipeline; choose a composition and load `{"spec": <contents of storyboard.json>}` as input props. The rendering service passes props automatically. Previewing generated audio requires the generated public/media assets.

## What works

- Three data-driven composition variants: discovery, mobile device frame, before/after.
- Real Playwright desktop/mobile recording and result assertion, local-release HTTP server, timeout/error metadata.
- Local Piper LJ Speech neural narration; PocketSphinx acoustic word alignment; burned-in four-word captions plus SRT.
- Frame-based typography, crop/zoom, original UI cues, voice loudness normalization and effects ducking.
- H.264/AAC render, full-file decode, black-gap scan, audio level measurement, exact format assertions.
- Current-source probes, curated candidate research, production history, duplicate avoidance and truthful daily shortfall reports.

## Limits

This is a production **foundation**, not a fully autonomous editorial system. Only the CyberChef Base64 capture/script adapter is implemented. The daily command defaults to three but will not invent subjects when its verified queue is exhausted. All three templates have still-frame checks; only discovery receives a full end-to-end video in the first test. Word timing uses acoustic alignment, not transcription confidence. Human listening and editorial review are still required before upload. No YouTube publishing is implemented.

Read [architecture](docs/architecture.md), [daily workflow](docs/daily-workflow.md), [troubleshooting](docs/troubleshooting.md), [RemotionUI](docs/remotionui.md), and [licenses](docs/licenses.md).

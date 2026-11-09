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

## Premium V2 (current default)

The main test command now produces `output/cyberchef-v2/final-v2.mp4` and preserves the original test video. The new fictional message is “Meet me on Mars.” Real CyberChef still performs the actual decode. The original renderer/templates remain available for legacy specs.

```bash
npm run test:pipeline                    # fresh capture, narration, direction, music/SFX, render, checks
npm run test:v2 -- --reuse               # deterministic edit iteration using retained speech/footage
npm run verify:v2                       # inspect actual MP4 and validate delivered mix
npm run test:creative
npm run test:premium-templates            # mobile/before-after previews plus original render compatibility
npm run export:v2                       # artifacts/cyberchef-v2.tar.gz
```

The export archive contains the revised MP4, script, structured storyboard, captions, quality/audio/retention reports, waveform, contact sheet and review notes. Large new renders remain ignored; no dedicated chat artifact-upload tool is available in this environment. Use the workspace file browser/file-transfer facility to retrieve `artifacts/cyberchef-v2.tar.gz`; the archive can be extracted with `tar -xzf cyberchef-v2.tar.gz`. Source and reports can be reviewed independently before explicitly publishing a video elsewhere.

[Premium architecture](docs/premium-design.md), [audit](docs/audits/cyberchef-v1.md), [troubleshooting](docs/troubleshooting-v2.md). Daily production uses the premium profile for verified adapters, still defaults to three, and still reports shortages rather than fabricating subjects. Human listening and editorial approval remain required before uploading.

### Download the reviewed v2 video from GitHub

Open `output/cyberchef-v2/final-v2.mp4` in this repository and choose **Download raw file**. The single reviewed MP4 and its reports are intentionally tracked for retrieval; raw recordings, audio stems, caches and generated media remain excluded. The original v1 video is preserved separately.

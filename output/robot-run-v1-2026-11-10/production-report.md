# Robot Run / HumanVoiceDirector — November 10, 2026

This deliverable is a faceless Short about an original Codex-authored 3D game prototype, not a Wanaka demonstration. Wanaka's official product page and Product Hunt listing were researched, but both wanaka.app and studio.wanaka.app returned proxy 403 in this executor. Rosebud and GDevelop were similarly blocked. A real Chromium/proxy probe was also attempted and is recorded in research.json. No authentication, credit, paywall, permission or network restriction was bypassed. No replacement product is falsely described as a newly launched service.

## Experiment and actual result

The user's proposed robot obstacle-course brief was used to author experiments/robot-run/index.html and game.js in this existing repository. This Codex assistant wrote the original Three.js prototype and made iterative corrections. It contains a small geometric robot, moving platforms, four glowing collectible coins, keyboard controls, jump physics and a finish portal. All visuals are procedural and original; no community game, promotional footage or third-party art was borrowed.

An initial automated run failed at a platform gap. Jump timing was revised and the keyboard test was rerun successfully. A recording exposed globally handled Space keys interfering with prompt typing; text inputs were excluded from game key handlers. An additional recording had a fall before completion due to external automation scheduling; the jump controller was moved into the browser, where it sends actual keyboard events into the same input handler. W is held through Playwright; no player teleport, win-state mutation or pre-rendered gameplay is used. The final recorded route asserts five jumps, four coins, zero falls and a reached portal. Only that route was tested, not all possible player actions.

The original brief is displayed and typed in a small local experiment page; it is explicitly labeled as a brief display, not an AI API/generation request. The source shot displays the actual game.js file from this session. No fake generation progress or third-party interface is shown. The game has a documented cinema view that hides its HUD for unobstructed footage; the actual runtime state and recording assertions supply the result evidence. The standard playable view retains its controls, coin counter and completion UI.

## Script and creative choices

Selected hook: “Can AI build a playable three D game?” Three internal hook concepts and five titles are in preproduction.json. The selected title is “I Asked Codex for a 3D Game. Then I Tested It.” These are editorial choices, not predictions of retention or views.

Final narration:

Can AI build a playable three D game? I gave Codex a robot obstacle course: moving platforms, glowing coins, and a finish portal. This is the local prototype it wrote. I tested the controls, collected the coins, then reached the portal. It runs, but this took code fixes, and it is not a finished game. Treat AI output as a starting point you still need to test. Subscribe for more AI experiments.

Real gameplay opens the video with the hook fully visible on frame zero. The brief, challenge, actual source and playable payoff follow the final acoustic phrase times. Most screen area is continuous original browser gameplay, with restrained camera movement, kinetic typography and word-synchronized captions. The prompt typing is accelerated 2× and labeled. The result sound and completion badge are scheduled for the end of the recorded route rather than the beginning of the test. The CTA stays attached to actual result footage, with a short intentional musical resolution after speech.

## Reusable voice upgrade

Engine inspected: sherpa-onnx 1.12.26 / Piper-VITS en_US-ljspeech-medium, one speaker (0), 22,050 Hz. Installed native controls include speaking speed and phrase generation, with length/noise parameters at model configuration level. Native SSML, emotion styles, fundamental-frequency instructions and word timestamps are not exposed. The working engine was retained.

HumanVoiceDirector adds validated phrases with curious/excited/anticipation/explanatory/satisfied directions; native rates; 0–350ms intentional pauses; sparse smooth 0.9dB word emphasis; 5ms edge fades; one voice identity; and final-waveform acoustic alignment. Mode names are not native learned emotion support. Five modes were synthesized in a smoke test; a formant-preserving Rubber Band pitch path was separately tested but remains OFF in the final take. No EQ-as-pitch substitution or playback-rate pitch shift is used.

Final directed narration is about 26.44 seconds. The original flat take is about 25.00 seconds. Both are supplied as narration.wav and narration-flat.wav. The directed version has measured rate/pause variation and bounded emphasis; the A/B pair allows listener judgment. PocketSphinx alignment is rerun after the final waveform is assembled, and caption times are bound to its SHA-256. Measured pitch estimates are descriptive only. Naturalness, human-like performance, pronunciation quality and absence of audible artifacts remain unverified by human listening in this environment.

The daily v3 path now uses a cache-aware narration helper, so text/performance/config/waveform changes invalidate stale timing. The common TTS entry point enables voice direction by default, with an explicit legacyFlatVoice opt-out. A caption rebalancing fix prevents article movement from generating six-word groups. Tests cover five-mode contracts, invalid controls, caption token preservation, timing consistency, waveform integrity and inserted pauses. A real cache reuse/invalidation test is included.

## Audio and licensing

Original 120 BPM playful electronic composition and synthesized event effects from the existing AudioDirector; no external music or samples. Narration normalization, speech-driven ducking, fades, separate stem checks and AAC-to-intended-mix correlation are retained. Three.js is MIT-licensed; its license is preserved in assets/licenses/Threejs-LICENSE. Voice/model licensing remains as documented in the existing project. No paid service, account creation or purchase was performed. Use of the existing Codex session is not a claim that Codex itself has a functional free tier.

## Verification and limits

Final codec, dimensions, duration, frame rate, complete decode, black-frame gaps, encoded mix, peaks, music/effect presence, final silence, safe text geometry, actual browser playback and encoded contact-sheet inspection are recorded in quality-report.json and audio-report.json. Voice measurements and limitations are in voice-quality-report.json. Native emotion synthesis and human-level voice quality are not claimed. Automated waveform checks cannot replace listening on headphones and phone speakers.

The local prototype is intentionally small and iterative; it is not an exhaustive game-builder benchmark, no-code product review, finished commercial game or verified Wanaka capability. Cloud software rendering limits source-capture smoothness and resolution relative to a desktop GPU recording. The 1080×1920 MP4 itself is 30 FPS. A better next step is broader permitted access for real third-party AI-builder experiments and listener-reviewed expressive voice selection.

Earlier videos are preserved. No YouTube upload is performed. The user's prior request to retain generated videos in Git is honored by the existing finished-MP4 ignore rules; raw captures, waveform intermediates and caches remain excluded. Source and finished artifacts are available in the versioned output folder and review bundle.

A final encoded-frame review found the subscribe text had low contrast against a mint platform. The last scene was rerendered with a contrasting badge, replaced at exact frame boundaries and encoded at constant 30 FPS; the original AAC track was preserved. Full encoded QA and playback were repeated afterward. All three prior template previews passed DOM safe-text measurements after the shared caption-grouping correction. The real narration-cache test proved reuse of an identical take and regeneration/re-alignment after a pause change.

## Final encoded results

27.115 seconds, 1080×1920, 30 FPS, H.264/AAC; 11574373 bytes. Full decode and actual Chromium playback passed. Peak -4.52 dBFS; decoded AAC correlation to intended music/voice/effects mix 0.999840; trailing silence 0.08s. Final output SHA-256: 24d2614fa5ca33e99e9717e9ecdf48f1c9fa9179be90e5f78ec83acea0cdd0b2. All technical checks pass; encoded frame review passed with noted source-resolution limits. Human listening remains pending.

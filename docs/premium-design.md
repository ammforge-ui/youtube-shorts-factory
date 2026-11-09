# Premium direction architecture

The original compositions, local TTS/alignment, browser capture and renderer remain. Optional `creative.version: 2` and per-scene `direction` fields select the premium engine; legacy specs still dispatch to the original implementation. Discovery, mobile and before-after IDs are preserved.

- StoryDirector: verified CyberChef adapter turns acoustic word anchors into purpose-based scenes. Future products add adapters, not React branches.
- CaptionDirector: punctuation, clauses, pauses and reading length control phrase boundaries. No fixed-count cross-sentence joins. Floating active-word captions use safe rectangles.
- ScreenFocusDirector / SmartScreenZoom: recorded element bounds map to bounded camera poses and easing. Mobile CSS coordinates are normalized to recorded pixels. Manual rectangle paths remain supported.
- MotionDirector: shared tokens, entrance styles and purpose-to-treatment vocabulary. Every selected treatment is encoded in the spec; unsupported product actions are rejected rather than invented.
- AudioDirector: original seeded 116 BPM composition with harmonic progression, bass, arpeggios, pads, percussion and a distinct synthesized effect library. Events reference visual frames. Actual narration controls sidechain ducking. Stem levels and the final mix are measured.
- RetentionDirector: configurable editorial heuristics for hook, payoff, shot variety, holds, captions, CTA and estimated UI text size. These cannot predict viewer behavior.
- QualityController: actual H.264/AAC/size/duration/full decode, silence/peak checks, real interaction assertions and explicit provisional scorecard categories.

Frame rendering, graphic noise and procedural soundtrack are deterministic for retained inputs. Neural speech generation can vary between runs; the generated WAV/alignment and story spec are retained and reused for deterministic edit revisions. No wall-clock animation runs inside Remotion.

Opening text transformation is a labeled fictional illustration. The actual result screenshot is captured only after CyberChef's decode assertion succeeds. Browser-only font enlargement and tooltip suppression improve legibility without changing inputs or results. No fictional security incident is implied.

Human listening remains the final authority on voice/music taste. Numerical audio presence, correlation and level tests establish delivery/integrity, not premium musical quality.

## Recording-time correction

Automation wall-clock times can precede the visible browser action, especially under load. align-recording.py compares 10 FPS recorded text masks with the actual captured input/result screenshots. It tolerates rasterization differences using a small morphological dilation and requires an explicit match threshold. Desktop matches drive source offsets; ambiguous low-resolution mobile matches are returned as `needs-review`, never silently passed. Current CyberChef mobile preview is render-compatible, but automated mobile action timing still requires manual review or a more suitable responsive product.

The final revision repaired only the affected input/selection frame range and concatenated it with the unchanged surrounding video using FFmpeg. The complete intended audio track was retained. This avoided another full render; full decode, format/length and encoded-mix correlation were rerun on the final assembled MP4. Future full production renders consume the corrected story offsets directly.

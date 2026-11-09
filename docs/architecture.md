# Architecture

`data/test-topic.json` supplies the script and product identity. `VideoSchema` validates composition inputs. `pipeline.ts` orchestrates source probes → actual browser capture → neural narration → acoustic forced alignment → storyboard anchoring → audio mix → Remotion render → QC → metadata/history. Services are independent modules under src/services; the rendering boundary can later move to another machine without changing the spec.

All three registered compositions consume the same JSON structure. Scenes contain title, editorial label, detail, duration, shot type, media path and footage offset. The mobile variant uses a phone frame and actual mobile footage. Before/after adds an explicit transformation context; discovery uses focused desktop footage. New topics require a verified research record, an appropriate interaction adapter and an approved script; do not just rename the current example.

Timing comes from actual narration and PocketSphinx acoustic word boundaries. Scene boundaries anchor to script words. Four-word caption groups retain acoustic start/end times and highlight the active word. TTS is version-pinned to sherpa-onnx 1.12.26 because 2.x removed the bundled phonemizer frontend used by these VITS models. Research scores are editorial judgments, not performance measurements.

The official CyberChef release is served locally on an ephemeral loopback port, with no mutation of product source. Browser capture preserves the actual interface; focused crops magnify Input, Recipe and Output. The result frame is an actual screenshot captured only after the decode assertion passes. No custom UI impersonates CyberChef. Mobile and desktop raw recordings are retained in output.

Visual composition uses RemotionUI source primitives for typography and entrance animation. A simple CSS gradient avoids GPU-only rendering. Custom phone framing and focused interface crops are deliberately small and deterministic. No external font requests occur during rendering. CPU concurrency is two.

Narration is normalized; original synthetic effects are sidechain-ducked against speech. There is no third-party background music. FFmpeg produces the final mix; Remotion encodes H.264/AAC. QC scans the entire encoded file, not just container metadata.

History is local JSON. Successful technical QC adds a record flagged for editorial review. No live server must survive between tasks. Output directories and generated public/media are ignored; the export archive is the retrieval boundary. Avoid concurrent daily processes until file locking/atomic history updates are added.

Safety: no credentials, paid calls, accounts, personal data or uploads. The example string is harmless. Geography configuration is editorial guidance and does not guarantee audience geography.

For the optional mobile template, the browser applies an explicit editor font-size accessibility override (28px) to the real product, and the composition magnifies the actual mobile capture. It does not replace interface text or change the result. CyberChef is a desktop-oriented three-pane tool; choose a genuinely mobile-friendly product for future mobile-first demos.

Capture hides transient help popovers/tooltips to keep recipe controls legible, and moves the pointer away after selecting the operation. Underlying input, operation settings and decoded output remain the actual application state.

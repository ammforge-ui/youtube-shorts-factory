# Premium troubleshooting

- Playwright recorder path must be set **before** importing Playwright. The CLI uses dynamic imports after PLAYWRIGHT_BROWSERS_PATH is initialized.
- V2 requires measured capture metadata, so v1 recordings cannot be silently reused for the new example. Missing metadata is a hard failure.
- Source CSS coordinates differ from recorded pixels in mobile Chromium. Capture stores coordinateScale and normalized targets.
- Narration must remain 28–32 seconds for this revision; the topic sets ttsSpeed=0.98. Duration is still derived from actual generated audio.
- A quiet music file is not sufficient. AudioDirector normalizes its composed bed, measures the ducked stem, and compares delivered AAC against the intended complete mix.
- Subjective musical/narration approval is not automated. Audio-input audition was attempted in this environment and returned unsupported. Use mix.wav/final-v2.mp4 for a human listening check.
- Original v1 is tracked and preserved. Premium outputs are ignored by default; export the complete review archive instead of committing another large rendered file automatically.

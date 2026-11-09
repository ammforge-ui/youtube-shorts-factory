# Daily workflow

When instructed PROCEED:

```bash
cd /workspace/youtube-shorts-factory
npm run produce:daily
```

Default count: 3. Override with `PRODUCTION_COUNT=1 npm run produce:daily`. The command loads config, reads history, selects unseen curated topic specs, runs the real pipeline sequentially, exports metadata and writes a daily report. An insufficient queue exits 2 and reports the actual count. It never duplicates the CyberChef example to make three outputs.

Current queue contains one verified CyberChef adapter. After the first test it is already in history, so daily production correctly reports zero new subjects. Autonomous discovery and distinct product interaction adapters remain to be implemented before three daily videos are practical. Add adapters with real assertions and script/storyboard policies before adding new IDs to the queue. The current script anchors are CyberChef-specific and reject incompatible scripts rather than silently producing a mismatched video.

Review quality-report.json, capture.json, script, source claims, extracted frames, captions and the complete soundtrack. Download the export archive, then perform a manual YouTube upload if desired. Never auto-publish. Track actual audience geography later in channel analytics.

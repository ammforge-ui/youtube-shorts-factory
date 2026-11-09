# Reusable environment configuration

The machine was prepared directly. Saving install_script/start_skill via the onboarding tool returned INVALID_ARGUMENT (draft could not be verified; persistence unconfirmed). Source files on disk are the reproducible fallback; no environment publication was performed.

Install script field:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /workspace/youtube-shorts-factory
bash scripts/setup.sh
```

Startup instructions field:

Use the existing isolated /workspace/youtube-shorts-factory checkout; no worktree unless requested. Read AGENTS.md. No persistent service is required; capture starts/stops its own server/browser. Run npm run test:pipeline, then npm run verify and npm run frames. Inspect encoded frames and listen to the soundtrack before publication. npm run studio is optional after generation; provide the storyboard as input props. On PROCEED, npm run produce:daily uses the configured count (three by default) and refuses exhausted/duplicate topics. Export with npm run export. Do not upload automatically.

The dependency/model directories /workspace/tts-python, /workspace/models, /workspace/tools/cyberchef and /workspace/pw-browsers must be retained or recreated with setup.sh. Processes are not part of retained state.

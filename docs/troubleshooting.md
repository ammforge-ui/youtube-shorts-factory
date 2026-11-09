# Troubleshooting

- Hosted sites return proxy 403: domain access is restricted. The official CyberChef GitHub release is the working local route. Required domains for broader research: remotionui.com, www.remotion.dev, excalidraw.com, squoosh.app, www.photopea.com, regex101.com, jsoncrack.com, gchq.github.io. Configuration draft saves currently return INVALID_ARGUMENT; no network edits were confirmed. Do not bypass the proxy.
- npm cache permission error: .npmrc points to writable /workspace/.npm-cache.
- Playwright recorder requests its ffmpeg: setup links the installed /usr/bin/ffmpeg into /workspace/pw-browsers/ffmpeg-1011. Set PLAYWRIGHT_BROWSERS_PATH=/workspace/pw-browsers. The official CDN was denied; the system FFmpeg was tested instead.
- Python build cannot find clang: CC=gcc CXX=g++ selects available compilers for PocketSphinx.
- sherpa-onnx 2.x reports missing phoneme frontend: install requirements-tts.txt; the tested engine is 1.12.26. Do not accept empty narration.
- Webpack cannot resolve @ aliases: both render.ts and remotion.config.ts explicitly map @ to src. Doctor checking tsconfig alone does not validate bundling.
- Narration duration outside 25–40 seconds or anchor missing: pipeline stops. Revise the supported script/storyboard adapter and regenerate narration. Never stretch speech silently to meet a target.
- Render failure: inspect actual logs, verify all public/media assets, rerun with --reuse after correction, then rerun QC.
- Daily report exits 2: insufficient new verified subjects, not a rendering failure. Extend the curated queue and interaction adapters.

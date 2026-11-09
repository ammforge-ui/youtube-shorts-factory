#!/usr/bin/env bash
set -euo pipefail
cd /workspace/youtube-shorts-factory
for tool in node npm python ffmpeg ffprobe chromium gcc g++; do command -v "$tool" >/dev/null || { echo "Missing system prerequisite: $tool" >&2; exit 1; }; done
npm ci --no-audit --no-fund
CC=gcc CXX=g++ python -m pip install --upgrade --target /workspace/tts-python -r requirements-tts.txt
mkdir -p /workspace/models /workspace/tools/cyberchef /workspace/pw-browsers/ffmpeg-1011
ln -sf /usr/bin/ffmpeg /workspace/pw-browsers/ffmpeg-1011/ffmpeg-linux
if [ ! -f /workspace/models/vits-piper-en_US-ljspeech-medium/en_US-ljspeech-medium.onnx ]; then
 curl -fL --retry 2 --max-time 180 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-ljspeech-medium.tar.bz2 -o /workspace/models/ljspeech.tar.bz2
 (cd /workspace/models && sha256sum -c /workspace/youtube-shorts-factory/config/model.sha256)
 tar -xjf /workspace/models/ljspeech.tar.bz2 -C /workspace/models
fi
if [ ! -f /workspace/tools/cyberchef/CyberChef_v11.5.0.html ]; then
 curl -fL --retry 2 --max-time 180 https://github.com/gchq/CyberChef/releases/download/v11.5.0/CyberChef_8cd426dd4f40f1423912d5fad91b578a86a65112.zip -o /workspace/tools/cyberchef.zip
 (cd /workspace/tools && sha256sum -c /workspace/youtube-shorts-factory/config/cyberchef.sha256)
 unzip -q /workspace/tools/cyberchef.zip -d /workspace/tools/cyberchef
fi
mkdir -p public/fonts
cp assets/fonts/*.ttf public/fonts/
npm run typecheck
npx remotion-ui doctor

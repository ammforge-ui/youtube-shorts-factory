# Assets and dependency rights

- CyberChef: official gchq/CyberChef v11.5.0 downloadable release, Apache-2.0; license retained under assets/licenses. Original browser footage made by this pipeline. Product marks remain their owners'. No external third-party video used.
- DejaVu Sans: local system fonts, Bitstream Vera/DejaVu terms retained in assets/fonts/LICENSE.txt. Copied locally for deterministic rendering.
- Voice: Piper en_US-ljspeech-medium distributed by k2-fsa/sherpa-onnx tts-models release. Model card retained. LJ Speech dataset is public domain according to the card; source and training links are retained. Reassess model/runtime licensing before redistribution or changing voices.
- sherpa-onnx runtime: Apache-2.0. PocketSphinx: BSD-style. Check installed dependency distributions for their full notices.
- Sound cues: original synthesized waveforms in src/services/audio.ts. No third-party samples. No downloaded music.
- RemotionUI: official source license retained in assets/licenses/remotionui-LICENSE. Components installed as source.
- Remotion: review https://www.remotion.dev/license for your organization and future commercial scale. This implementation does not purchase a license or assume every commercial use is free.

Asset/model archives were fetched over verified TLS from official GitHub release links. SHA-256 values recorded from those successful downloads are pinned in config for repeatable integrity checks; they are not independently signed publisher attestations.

## V2 procedural soundtrack

AudioDirector generates a seeded 116 BPM composition and ten effect timbre categories from oscillators/noise/envelopes, with an explicit harmonic/rhythmic arrangement. No outside recordings, melodies or commercial tracks are downloaded. The project permits YouTube publication and automated reuse of these original generated assets, with no required attribution and no claim of exclusive copyright in common musical patterns. Every run saves audio-assets.json and actual stem filenames/measurements in audio-report.json. Listening quality is an editorial judgment, not established by licensing or level checks.

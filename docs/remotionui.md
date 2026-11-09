# RemotionUI evidence

Direct requests to the user-listed remotionui.com URLs were denied by cloud policy. Used the official npm package README and its linked official repository https://github.com/riaz37/remotion-ui instead. Source checkout used commit 0aecaca2b61a167992e1205d10e4da16d8a71331. Read apps/web/content/docs/installation.mdx, registry.json and actual component source. Official Remotion rendering docs were retrieved from remotion-dev/remotion on GitHub (docs/references/remotion-render.mdx).

Inspected 254 actual registry items. Suitable verified names: split-text-chars (hook/kinetic typography), caption-highlight / karaoke-captions / word-pop-captions (word captions), browser-flow (browser preview scene), callout-spotlight (UI highlights), mesh-gradient-bg / grain-gradient-bg (backgrounds), blur-reveal (TransitionSeries transition), slide-up / fade-in (callouts and CTA). No phone-frame primitive was assumed; the small custom phone frame avoids inventing registry imports. Browser-flow is a more opinionated scene than the focused footage card needed here.

Executed:

```bash
npx remotion-ui init --existing --no-agent-skill
REMOTION_UI_REGISTRY_URL=/workspace/rui-registry npx remotion-ui add fade-in slide-up split-text-chars caption-highlight mesh-gradient-bg blur-reveal
npx remotion-ui doctor
```

The supported local registry mechanism was used. Each registry item JSON was constructed from the unmodified official registry manifest and exact official source file contents, with dependency metadata retained. This is a local mirror of the official source, not invented components. Source files and upstream license are retained in this repository, so ordinary setup does not need to re-fetch the registry.

Installed: fade-in, slide-up, split-text-chars, caption-highlight, mesh-gradient-bg, blur-reveal plus recursive support libraries. Used in the final composition: SplitTextChars, SlideUp, CaptionHighlight; FadeIn is installed and available but not used. The GPU mesh background and blur transition remain installed but unused in this CPU-focused initial render. Custom CSS gradient/crops keep rendering predictable. Doctor passes all required checks. Actual props were read from source and TypeScript-checked.

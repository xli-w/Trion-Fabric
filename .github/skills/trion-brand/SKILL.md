---
name: trion-brand
description: Use for Fabric visual language, calm workbench interactions, and precise product copy.
---

# Trion brand and Fabric UI language

Use this skill for UI, visual, copy, and interaction decisions. Fabric should
feel professional, technical, structured, modern, calm, practical,
engineering-led, and information-focused: a transformation workbench rather
than a corporate software suite.

Use the existing tokens in `packages/ui/src/styles/tokens.css` and primitives
in `packages/ui`. The language is Aptos/IBM Plex-style sans typography, modest
radii, clear borders, semantic success/warning/danger colours, and
information-dense tables/cards. Fabric ships two themes, switched at runtime
via `ThemeProvider`/`useTheme` in `packages/ui/src/theme/ThemeContext.tsx`
(`dark`, `light`, or `system`, persisted per user, applied through the
`data-theme` attribute):

- **Dark ("Pure Black Dark Mode", default):** a pure black shell and surfaces
  with a Trion purple accent (`--fabric-accent: #8b5cf6`) and white/grey text.
- **Light ("Light Precision"):** a light canvas (`--fabric-main-bg: #edf0f3`)
  with white/near-white surfaces and a Trion pine accent
  (`--fabric-accent: #1d7f73`).

Extend tokens (and add both a `[data-theme="light"]` and `[data-theme="dark"]`
value) rather than introducing one-off or theme-blind colours. Never hard-code
a colour that should switch between the pure black/purple dark theme and the
light/pine theme.

Make the active client, site, and engagement legible but unobtrusive. Give
Workspace, Understand, Analyse, and Plan & Output a clear hierarchy; use
contextual panels, drill-downs, and cross-links for secondary records. Surface
the current position, evidence strength, uncertainty, and the next useful
action instead of filling space with dashboard decoration.

Prefer strong hierarchy, short precise labels, readable density, clear status
badges, and calm feedback. Use colour as a semantic cue, not decoration. Keep
focus states, contrast (in both themes), keyboard access, and responsive
layouts explicit. Internal workbench screens may be detailed and editable;
client outputs should be selective and presentation-ready.

Avoid generic AI gradients, playful SaaS styling, excessive animation, chart
decoration, colour overload, giant dashboards, enterprise-admin visual
language, and buzzword-heavy copy. Use manufacturing and transformation
terminology accurately; do not make the marketing brand or a hypothetical
design system up.

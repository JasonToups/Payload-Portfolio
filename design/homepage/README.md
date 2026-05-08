# Homepage redesign — handoff

This folder is the design source for the V2 Kinetic homepage. Drop it at
`design/homepage/` in the Payload repo. It contains everything Claude Code
needs to read in order to build the page in the real codebase.

## Files

| File | What it is |
|---|---|
| `BUILD.md` | The build plan. Read this first. Section-by-section field schemas, component changes, and a suggested build order. |
| `PROMPT.md` | Copy-paste prompt for Claude Code. |
| `Homepage.html` | The reference design. Open it in a browser to see the finished page (light + dark, ember accent default). |
| `v2-kinetic.jsx` | React/JSX implementation of the page sections. **Source of truth for layout, spacing, copy patterns, and motion.** |
| `shared.jsx` | Shared bits — `<Mark>` (animated logo), `<PillHeader>`, `<Foot>`, `<NewsletterRibbon>`, sample data. |
| `styles.css` | Design tokens (mirrors your existing `globals.css`) + animation keyframes (`spin`, `pulse`, `swap`, `marquee`) + utility classes (`.bento-tile`, `.svc-row`, `.tag`, etc.). |
| `tweaks-panel.jsx` | Demo tweaks UI for theme/accent — **not for production**, just lets you preview the design with different palettes. Ignore in the build. |

## How to read the design

1. Open `Homepage.html` in a browser. The Tweaks panel (top right) flips
   theme (light/dark) and accent (cyan / violet / lime / ember). Ember is
   the picked direction.
2. Match every visual decision to a line in `v2-kinetic.jsx`. The JSX uses
   inline styles + utility classes from `styles.css` so it's easy to trace.
3. When in doubt, the visual reference wins over the prose in `BUILD.md`.

## Scope

- **In:** Hero, "What I do" (bento), Recent posts, Newsletter, Testimonials,
  Footer.
- **Out:** Post detail pages, About page, Search. Those keep their existing
  templates; only the homepage layout is changing.

## Migration notes

- The CMS schema gets new fields (see `BUILD.md`). Existing pages with the
  old schema need a migration that backfills sensible defaults — empty
  `tiles` array, `layout: 'list'` on existing Services blocks, etc. — so
  they keep rendering during the rollout.
- The `<Logo>` swap to `<Mark>` is global. If `<Logo>` is referenced
  outside the header/footer (admin login, email templates), keep the old
  one in those places.
- Ember can be added alongside cyan as a new accent token, or replace cyan
  outright. The design is built so a single token swap re-skins the whole
  page.

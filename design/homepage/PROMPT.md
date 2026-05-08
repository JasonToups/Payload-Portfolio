# Claude Code prompt

Paste this in your first message to Claude Code from the repo root.

---

## Prompt

```
I have a homepage redesign ready to build, with the spec and reference
design at design/homepage/. Please start by reading these files in order:

  1. design/homepage/README.md     ← orientation
  2. design/homepage/BUILD.md      ← the build plan, field schemas, and order
  3. design/homepage/Homepage.html ← open mentally; look at the JSX it loads
  4. design/homepage/v2-kinetic.jsx ← visual source of truth
  5. design/homepage/shared.jsx     ← Mark, header, footer, newsletter
  6. design/homepage/styles.css     ← tokens + animation keyframes

Then explore the matching files in src/ that you'll be editing:

  - src/heros/LandingImpact/index.tsx
  - src/heros/config.ts
  - src/blocks/Services/Component.tsx
  - src/blocks/Services/config.ts
  - src/blocks/Subscribe/Component.tsx (if present)
  - src/blocks/Testimonials/Component.tsx
  - src/Header/Component.client.tsx
  - src/Footer/Component.tsx
  - src/components/Logo/Logo.tsx
  - src/app/(frontend)/globals.css

Build in the order listed at the bottom of BUILD.md:

  §0  <Mark> component + Logo swap
  §1  Hero (LandingImpactHero) — eyebrow, version, headline group with
      rotatingWords, manifesto, marquee
  §2  Services block — add layout: 'list' | 'bento' selector and
      polymorphic `tiles` array (kinds: service | cta | currentlyBuilding)
  §3  Recent posts card refresh
  §4  Subscribe block polish
  §5  Testimonials — featured boolean + colored center pop

Hard rules:

  - Match the JSX in v2-kinetic.jsx as closely as you can — same DOM
    structure, same copy patterns, same Tailwind/CSS-token usage.
  - Reuse existing tokens in globals.css (--primary, --foreground,
    --neutral-*, --font-display, etc.). Do not introduce new colors except
    for the four @keyframes blocks added to globals.css.
  - For Payload schema changes, write a migration that backfills sensible
    defaults so existing Page documents keep rendering during rollout.
  - Conditional groups in Payload field configs (admin.condition) are
    used to keep the bento tile editor clean — see BUILD.md §2 for the
    exact shape.

Stop and check in with me after §0 is done so I can confirm the Mark
looks right before you continue. Then again after §2 (the biggest
schema change). After that, finish the remaining sections in one pass.

Run `pnpm payload generate:types && pnpm payload migrate` whenever you
change a collection/block config. Make sure the dev server still
type-checks and renders the homepage without errors before each
checkpoint.
```

---

## After §0 — what to look for

- The `<Mark>` should have two animated rings (one slow clockwise, one
  faster counter-clockwise with a dashed outer + small filled dot) and a
  pulsing JT-shaped core.
- It should appear at ~28px in the header (left of "Jason Toups") and
  ~28px in the footer (left of the wordmark).
- Verify on both `/` and a posts page.

## After §2 — what to look for

- Open the Pages admin → home page → switch the Services block to
  `layout: bento` → see the polymorphic tiles editor. You should be able
  to add a `cta` tile, fill in availability + heading + button, and
  preview it on the front-end matching the bento grid in `Homepage.html`.
- The `kind` selector on each tile row should hide/show its conditional
  group (`cta` group only when kind=cta, `building` group only when
  kind=currentlyBuilding).

## Iteration tip

If the LLM drifts from the visual, ask:

> Open design/homepage/Homepage.html in a browser, look at section <X>,
> then re-implement it in src/<file>. Match the DOM structure, spacing,
> and copy.

The reference design is the source of truth — words on the page can be
ambiguous, the JSX cannot.

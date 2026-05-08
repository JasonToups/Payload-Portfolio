<!-- SEED — re-run $impeccable document once there's code to capture the actual tokens and components. -->

---
name: Now Hiring — Engineer Portfolio Template
description: Warm, choreographed portfolio for engineers who show up like a product
---

# Design System: Now Hiring — Engineer Portfolio Template

## 1. Overview

**Creative North Star: "The Warm Signal"**

This system is built around a single idea: warm light cutting through digital noise. In a landscape of cold, minimal, indistinguishable engineering portfolios, this site signals craft through contrast — not stylistic contrast, but human contrast. Amber warmth where others are arctic gray. Choreographed motion where others are static. A voice that sounds like a person, not a résumé.

The engineer is the product, and the design proves it before a word is read. Amber commits to a presence on every screen — not as accent, but as atmosphere. A bold serif display font sets the intellectual register immediately: this is someone who thinks carefully, writes clearly, and sweats the details. Shader-based animated backgrounds from [shaders.com](https://shaders.com/) are used in the hero and key feature sections — not as decoration, but as proof of technical sensibility. The site feels alive because its author is.

Motion is choreographed, not sprinkled. Page entrances are orchestrated. Sections reveal themselves as the user scrolls, with elements fading and translating in — drawing the eye down, rewarding curiosity. Every animation respects `prefers-reduced-motion`; the layout holds without it.

This system explicitly rejects the LinkedIn aesthetic: performative professionalism, flat blue hierarchies, engagement-bait structure, the visual grammar of a platform optimized for corporate anxiety. It also rejects the "dark SaaS hero + gradient blob + 47 feature cards" pattern — the first AI template reflex. And it rejects the cold minimal portfolio that feels like a mood board rather than a person.

**Key Characteristics:**
- Amber as atmosphere, not accent — committed, not cautious
- Bold serif display that commands authority without distance
- Shader-animated hero surfaces from shaders.com (WaveDistortion, Glass, LinearGradient)
- Scroll-driven choreography: staggered reveals, fade-translate entrances
- Warmth earns trust — every surface should feel approachable before it feels impressive
- Two conversion goals visible at all times: Subscribe and Contact

## 2. Colors

A committed warm amber palette: one saturated color carries the room. Neutrals exist to amplify it, not compete with it.

### Primary
- **Warm Amber** `[to be resolved during implementation — anchor: warm amber, OKLCH ~65% chroma ~0.18 hue ~60–70°]`: The load-bearing color. Used in hero backgrounds, section washes, CTA buttons, and hover states. At 30–60% surface presence on key pages.

### Secondary
- **Deep Amber / Burnt Sienna** `[to be resolved — OKLCH ~45% chroma ~0.15 hue ~55°]`: Used for pressed/active states, emphasized text, inline links, and depth layering within amber sections.

### Neutral
- **Warm Off-White** `[to be resolved — OKLCH ~97% chroma ~0.005 hue ~70°]`: Page background in light sections. Tinted toward amber — never pure white.
- **Warm Near-Black** `[to be resolved — OKLCH ~12% chroma ~0.01 hue ~60°]`: Primary text. Tinted toward amber — never pure black.
- **Warm Mid-Gray** `[to be resolved — OKLCH ~55% chroma ~0.005 hue ~65°]`: Secondary text, captions, metadata, dividers.

### Named Rules

**The Amber Commitment Rule.** Warm amber carries 30–60% of any given screen. This is not an accent color — it is the atmosphere. Sections that don't use amber as a background color should still feel warm through typography, hover states, or border treatments. Amber rarity is not the strategy here; amber saturation is.

**The Tinted Neutral Rule.** No surface is ever pure white (`#ffffff`) or pure black (`#000000`). Every neutral is tinted toward the amber hue (chroma 0.005–0.01 in OKLCH is sufficient). The stack feels coherent because no color exists outside the warmth envelope.

## 3. Typography

**Display Font:** Fraunces — Extra Bold (800) or Black (900) weight `[confirm at implementation — Google Fonts, optical size axis available]`
**Body Font:** Plus Jakarta Sans — Regular (400) and Medium (500) `[confirm at implementation — Google Fonts]`
**Mono Font:** Geist Mono (already in stack) — for code snippets and technical labels

**Character:** Fraunces is a warm, optical-size serif with visible personality — it reads like a person who has opinions, not a brand that has guidelines. At heavy weights it commands space without becoming aggressive. Plus Jakarta Sans is humanist and warm, never geometric-cold — it complements Fraunces without competing. The pairing says: I think carefully and I communicate clearly.

### Hierarchy
- **Display** (Fraunces 900, clamp(3rem, 8vw, 6rem), line-height 0.9–1.0): Hero headlines, above-the-fold value proposition. Set tight. One or two lines maximum.
- **Headline** (Fraunces 800, clamp(2rem, 5vw, 3.5rem), line-height 1.05): Section introductions, post titles, feature headers.
- **Title** (Fraunces 700 or Plus Jakarta Sans 700, clamp(1.25rem, 2.5vw, 1.75rem), line-height 1.2): Card headers, subsection titles, pull quotes.
- **Body** (Plus Jakarta Sans 400, 1rem–1.125rem, line-height 1.65, max 68ch): All running prose, post content, descriptions. Never below 16px. Line length capped at 65–75ch.
- **Label** (Plus Jakarta Sans 500, 0.875rem → minimum 1rem at implementation, letter-spacing 0.04em, uppercase): Navigation, tags, button text, metadata. Enforce 16px floor.

### Named Rules

**The Serif Authority Rule.** Fraunces appears only at Display, Headline, and Title levels. It never appears as body copy or labels. Its authority comes from its rarity within the hierarchy — overusing it collapses the contrast that makes it powerful.

**The Weight Contrast Minimum.** Adjacent typographic levels must differ by at least one full weight step (e.g., 800 → 500, not 800 → 700). Flat weight scales feel unfinished. The eye needs a clear staircase.

## 4. Elevation

Choreographed motion implies layered surfaces — depth is earned through scroll and interaction, not declared by default. At rest, the page is grounded and flat. As the user scrolls, sections surface: cards lift, elements translate in, amber washes expand.

Shader backgrounds (shaders.com) create a distinct third layer — dimensionality that is neither surface nor shadow but atmosphere. Hero sections use animated shader canvases as depth planes behind content, creating perceived z-depth without traditional shadows.

Traditional box shadows are used sparingly and structurally: only on interactive surfaces (cards on hover, dropdowns, dialogs) — never decoratively.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Elevation is a response to state or scroll position — not a permanent style declaration. A shadow that is always visible is not communicating anything.

**The Shader-as-Depth Rule.** Animated shader backgrounds (WaveDistortion, LinearGradient from shaders.com) replace traditional hero shadow/depth techniques. They provide perceived depth and motion without relying on box-shadow or z-index stacking. Use in: hero section, featured newsletter section, CTA section. Do not use on every section — their impact depends on scarcity.

## 5. Components

*Components are omitted in seed mode. Document in a follow-up `$impeccable document` pass once implementation begins.*

**Planned signature components to document at that time:**
- Hero section with shaders.com animated background (WaveDistortion or LinearGradient)
- Newsletter subscribe CTA (primary conversion — warrants its own component documentation)
- Post card with hover lift and amber accent
- Keyboard-navigable navigation with animated active state
- Contact form with inline validation and focus states

## 6. Do's and Don'ts

### Do:
- **Do** use warm amber as atmosphere — commit to 30–60% surface presence on hero and feature sections, not as a button highlight on an otherwise gray page.
- **Do** use Fraunces at Black or Extra Bold weight for all display and headline use. The "bold choice" directive is non-negotiable — light or regular weight collapses the intended authority.
- **Do** place the newsletter subscribe CTA above the fold, or within the first two scroll stops. It is the primary conversion goal; it earns prime real estate.
- **Do** choreograph page entrance animations: the hero headline, subhead, and CTA should stagger in on load (100–150ms between each). Section reveals should use fade + translate-up (24px, 400ms ease-out-quart).
- **Do** use shaders.com WaveDistortion or LinearGradient components for the hero background and key CTA sections. They signal technical sensibility and make the site feel alive without gratuitous decoration.
- **Do** wrap all motion in `prefers-reduced-motion` checks. State transitions (color, opacity at rest) survive; translate/scale/entrance animations are suppressed.
- **Do** tint every neutral toward amber. Off-white backgrounds, near-black text — all carry chroma 0.005–0.01 toward the hue anchor.
- **Do** enforce 65–75ch max line length on all body copy. Hiring managers reading on widescreen monitors should not scan 120-character lines.
- **Do** make focus rings visible, amber-tinted, and consistent across all interactive elements. Keyboard navigation is a first-class experience.

### Don't:
- **Don't** design anything that looks or feels like LinkedIn — no flat blue hierarchies, no engagement-bait card layouts, no performative professional tone, no "Top Voice" badge energy. LinkedIn is the anti-reference. If a component could appear on LinkedIn without modification, redesign it.
- **Don't** use the "dark SaaS hero + gradient blob + 47 feature cards" pattern. This is the first AI template reflex and the project's primary aesthetic anti-reference.
- **Don't** build a cold, minimal portfolio that reads as a mood board instead of a person. Warmth is not optional — it is the differentiator.
- **Don't** bury the newsletter subscribe CTA. It is not a footer element. It is a primary conversion goal that belongs in the hero and at least one mid-page section.
- **Don't** use pure white (`#ffffff`) or pure black (`#000000`) anywhere. Every surface must carry the amber warmth tint.
- **Don't** use `text-xs` or `text-sm` for any visible text. 16px is the enforced floor, no exceptions.
- **Don't** use side-stripe borders (border-left or border-right greater than 1px as colored accents on cards or callouts). Use full borders, background tints, or nothing.
- **Don't** apply gradient text (`background-clip: text`). Use a single solid color. Emphasis via weight or size.
- **Don't** use Fraunces below Title level. Its authority collapses if used for body copy or labels.
- **Don't** add motion that cannot be turned off. Every entrance animation, scroll sequence, and choreographed reveal must be gated by `@media (prefers-reduced-motion: no-preference)`.
- **Don't** use shader backgrounds on more than two or three sections per page. Their impact depends on scarcity — overuse turns atmosphere into noise.

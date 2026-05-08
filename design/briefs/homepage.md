# Design Brief: Homepage

## 1. Feature Summary

The homepage of a Payload CMS engineer portfolio template. It lands cold visitors — hiring managers and prospective clients who have 90 seconds and no prior context — and must establish who the engineer is, why they're worth remembering, and give them one clear action. The primary conversion is the Contact page ("Work with me"). Newsletter subscription is the secondary conversion, positioned immediately below the hero as a persistent lower-friction offer.

## 2. Primary User Action

Click through to the Contact page. The hero's primary CTA drives here. Everything else — subscription, posts, services — is supporting evidence that earns that click.

## 3. Design Direction

- **Color:** Committed amber. Hero and Contact CTA sections are amber-drenched. Middle content sections breathe in warm off-white. One inverted section (warm near-black) mid-page for drama and contrast.
- **Scene sentence:** A hiring manager opens a new tab from a cold email at 2pm on a Tuesday — slightly skeptical, moderately curious, with a calendar notification 8 minutes away. The page has until the notification fires to make them open the Contact page.
- **References:** shaders.com (hero depth), affinity.studio (scroll-choreography pulling the eye downward), Clerk (warmth that reads as competence, not casualness).

## 4. Scope

- **Fidelity:** Mid-fi — layout, hierarchy, spacing rhythm, and section order confirmed; no production-polished components yet
- **Breadth:** Full homepage scroll, all sections
- **Interactivity:** Scroll reveal behavior described; form states described; not yet built
- **Intent:** Confirm the layout before committing to production build

## 5. Layout Strategy

Eight sections in scroll order, alternating warm off-white and amber for rhythm:

| # | Section | Background | Primary job |
|---|---|---|---|
| 1 | **Hero** | Amber + shader canvas | Who you are and why it matters — in 5 seconds |
| 2 | **Newsletter Subscribe** | Amber (continuation) | Primary subscription capture, zero friction |
| 3 | **About / Bio** | Warm off-white | Human, warm, brief — the person behind the work |
| 4 | **Services** | Warm off-white | What problems you solve, for whom |
| 5 | **Recent Posts** | Warm off-white | Proof of thinking — existing Payload block |
| 6 | **Skills / Stack** | Warm near-black (inverted) | Scannable signal for hiring managers |
| 7 | **Testimonials** | Warm off-white | Social proof — quotes in Fraunces display |
| 8 | **Contact CTA** | Amber (closing strong) | Mirror of the hero energy — final conversion |

**Visual rhythm:** Amber bookends the page (sections 1–2, section 8). The middle six sections alternate off-white and inverted, with amber reserved for the sections that carry conversion weight. The inverted skills section at position 6 creates a dramatic contrast moment mid-scroll, draws the eye down, and resumes warm off-white through testimonials before the amber close.

**Hero structure:**
- Shader canvas (LinearGradient, warm amber tones) as full-viewport background layer
- Fraunces Black 900, clamp(3rem, 8vw, 5.5rem): Primary headline — engineer name or "I build [X]"
- Plus Jakarta Sans 400, ~1.25rem: Value prop subhead — drawn from existing copy: *"Developer portfolios don't communicate your value as an engineer. Present yourself as a business."*
- Primary button: "Work with me" → Contact page
- Subdued secondary element: "Get the newsletter ↓" — anchor link to section 2

## 6. Key States

| State | What the user sees |
|---|---|
| Default | All sections populated, 2–3 recent posts visible |
| Recent Posts empty | Block hides or shows a CMS prompt (handled by existing block behavior) |
| Subscribe success | Inline confirmation replaces form — no page reload |
| Subscribe error | Red text below input per project's existing validation pattern (`<p role="alert">`) |
| Shader canvas loading | Static amber LinearGradient CSS fallback renders instantly; canvas fades in over 600ms |
| Mobile | Hero full-width stacked, subscribe form full-width, all sections single-column |
| `prefers-reduced-motion` | All entrance animations suppressed; layout and color unchanged |

## 7. Interaction Model

- **On load:** Hero headline, subhead, and CTA button stagger in — 120ms delay between each element, fade + translate-up (16px, 350ms ease-out-quart). Shader canvas fades in over 600ms.
- **Scroll reveals:** Each section's content fades + translates up (24px, 400ms ease-out-quart) as it enters the viewport. Stagger within sections: 80ms between child elements.
- **Subscribe form:** Amber-tinted focus ring on input. Button hover: slight lift (translateY -2px) + deepened amber. Success: form replaced by confirmation text inline.
- **Post cards:** Hover lifts the card (box-shadow appears, translateY -3px, 200ms). Amber underline animates in on post title.
- **Contact CTA button:** Hover deepens amber, slight scale (1.02), 180ms ease-out.
- **All motion gated:** `@media (prefers-reduced-motion: no-preference)` wraps every transition and entrance.

## 8. Content Requirements

| Element | Placeholder / Default |
|---|---|
| Hero headline | `Developer Landing Page` (existing) — in production: engineer's name or primary value statement |
| Hero subhead | Existing copy: *"Developer portfolios don't communicate your value as an engineer..."* |
| Hero primary CTA | "Work with me" |
| Hero secondary | "Get the newsletter ↓" |
| Subscribe header | "Stay in the loop." |
| Subscribe subhead | "I write about [topic]. No noise, no filler. Unsubscribe any time." |
| Subscribe button | "Subscribe" |
| About headline | "About me" (Fraunces Headline) |
| About body | 2–3 sentences, warm and direct |
| Services headline | "What I do" |
| Services items | 2–3 entries: title + 1-sentence description |
| Skills headline | "My stack" |
| Skills content | Category labels + technology names — no percentage bars, no star ratings |
| Testimonials | 2–3: quote (Fraunces display) + name + role/company |
| Contact CTA headline | "Let's build something." |
| Contact CTA button | "Get in touch" → Contact page |

## 9. Payload Block Build Scope

| Section | Build status |
|---|---|
| Hero | Update existing — wire all copy to Payload rich text fields |
| Newsletter Subscribe | Existing Payload block — integrate into homepage layout |
| About / Bio | Existing or new Payload block |
| Services | **New Payload block** |
| Recent Posts | Existing Payload block |
| Skills / Stack | **New Payload block** |
| Testimonials | **New Payload block** |
| Contact CTA | New section — amber close |

New blocks to build: **Services**, **Skills/Stack**, **Testimonials**.

## 10. Recommended References

When moving to `$impeccable craft`:
- `reference/animate.md` — choreographed entrances, scroll-driven stagger sequences
- `reference/layout.md` — section rhythm, spacing cadence, alternating background pattern
- `reference/typeset.md` — Fraunces display usage, hierarchy enforcement

## 11. Open Questions Resolved

1. **Newsletter Subscribe** → existing Payload block, integrate into homepage layout
2. **Skills/Stack + Testimonials** → new Payload blocks
3. **Services** → new Payload block (unique interactions warranted)
4. **Hero copy** → all fields (headline, subhead, CTAs) driven by Payload rich text — fully customizable per engineer

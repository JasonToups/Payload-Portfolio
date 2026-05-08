# Build plan — Homepage V2 Kinetic in Payload

A field-by-field breakdown of what to update in your existing components and
what to add. Section order matches the artboard top-down.

---

## 0. Shared — animated `<Mark>` component

Replaces the static `Logo` everywhere it appears (header, footer, bento tiles).

- **New file:** `src/components/Mark/index.tsx`
- Self-contained SVG with two CSS-animated `<g>` rings + a pulsing core glyph.
- Accept `size` (number) and `accent` (`"primary" | "current"`) props.
- Add `@keyframes spin` and `@keyframes pulse` to `globals.css` (or a colocated
  CSS module).
- Swap the existing `<Logo />` calls in `src/Header/Component.client.tsx` and
  `src/Footer/Component.tsx` for `<Mark />`.

No CMS fields needed — it's pure presentation.

---

## 1. Hero — extend `LandingImpactHero`

File: `src/heros/LandingImpact/index.tsx` and `src/heros/config.ts`.

Right now `landingImpact` only has `heading`, `richText`, and `links`. The new
hero needs more structured pieces so authors can edit them independently.

### New fields on the `landingImpact` hero

```ts
{
  name: 'eyebrow',                       // "NOW HIRING ME — INDEX"
  type: 'text',
},
{
  name: 'version',                       // "v.26.05.07" — auto-fill or manual
  type: 'text',
},
{
  name: 'headline',                      // group with rotating word
  type: 'group',
  fields: [
    { name: 'before', type: 'text' },    // "I build"
    { name: 'emphasis', type: 'text' },  // "software"  (rendered italic + accent)
    { name: 'middle', type: 'text' },    // "that earns its place on the"
    { name: 'rotatingWords', type: 'array', fields: [
      { name: 'word', type: 'text' }     // "roadmap.", "balance sheet.", "team chat."
    ]},
  ],
},
{
  name: 'manifesto',                     // small body copy left of CTAs
  type: 'textarea',
},
{
  name: 'ctas',                          // existing `links` already covers this
  // keep `links` as-is, just allow 2 entries
},
{
  name: 'marquee',                       // skill ticker under hero
  type: 'array',
  fields: [
    { name: 'label', type: 'text' },
    { name: 'emphasis', type: 'checkbox' }, // styled italic + accent every Nth
  ],
},
```

### Component changes

- Render `headline.rotatingWords` inside a `<span class="word-swap">` and let
  CSS `@keyframes swap` cycle them (3-state, 9s loop). All three words live in
  the DOM at once stacked via `display: grid` — no JS needed.
- Marquee is one `<div class="marquee">` with two duplicated tracks for a
  seamless loop. The duplicated track is rendered server-side in the component.

---

## 2. "What I do" — promote `Services` block to a Bento variant

File: `src/blocks/Services/Component.tsx` + `config.ts`.

Right now Services is a flat numbered list. We want a **bento grid variant**
that reuses the same schema where possible plus two new tile types.

### Field changes on the Services block

```ts
{
  name: 'layout',
  type: 'select',
  options: ['list', 'bento'],            // new — keep `list` as the existing render
  defaultValue: 'bento',
},
{
  name: 'tiles',                          // new, only used when layout=bento
  type: 'array',
  fields: [
    {
      name: 'kind',
      type: 'select',
      options: ['service', 'cta', 'currentlyBuilding'],
    },
    // service tile (existing fields plus tags)
    { name: 'number', type: 'text' },        // "01"
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'size', type: 'select', options: ['span-2', 'span-4'] },
    { name: 'tags', type: 'array', fields: [
      { name: 'label', type: 'text' },
    ]},
    // cta tile
    { name: 'cta', type: 'group', admin: { condition: (_, s) => s.kind === 'cta' }, fields: [
      { name: 'eyebrow', type: 'text' },     // "— Book a slot"
      { name: 'availability', type: 'text' },// "3 SLOTS · MAY"
      { name: 'heading', type: 'text' },     // "Book some time."
      { name: 'body', type: 'textarea' },
      { name: 'buttonLabel', type: 'text' }, // "Open calendar"
      { name: 'buttonHref', type: 'text' },
    ]},
    // currentlyBuilding tile
    { name: 'building', type: 'group', admin: { condition: (_, s) => s.kind === 'currentlyBuilding' }, fields: [
      { name: 'eyebrow', type: 'text' },     // "— Currently building"
      { name: 'liveLabel', type: 'text' },   // "LIVE · WK 19"
      { name: 'heading', type: 'text' },     // "Broadcasts → Resend pipeline…"
      { name: 'checklist', type: 'array', fields: [
        { name: 'label', type: 'text' },
        { name: 'done', type: 'checkbox' },
      ]},
    ]},
  ],
},
```

### Component changes

- Branch on `layout`: `<ServicesList>` (existing render) vs `<ServicesBento>`.
- `ServicesBento` walks `tiles` and dispatches by `kind` → three sub-components
  living in the same file:
  - `<TileService>` — renders title/desc/tags + number eyebrow
  - `<TileCta>` — colored ember tile, dark Open Calendar button
  - `<TileBuilding>` — dark tile, animated dot, checklist with `✓`/`○` glyphs
- Each tile uses `gridColumn: \`span ${size === 'span-4' ? 4 : 2}\`` on the
  enclosing `<div>`.
- The grid container is `display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem`.

---

## 3. Recent posts — update `ArchiveBlock` (or the inline post card)

Wherever you currently render the three-card row (looks like `RelatedPosts`
or an inline render in the page template). The card needs:

- A `NO. 0X` plate on the thumbnail (overlay with `position: absolute`).
- A "X MIN READ" stat bottom-left and a `→` arrow bottom-right inside a
  bordered footer row.
- Date format `MM.DD.YY`.

### Optional new field on the `Post` collection

```ts
{ name: 'readMinutes', type: 'number' },   // estimated read time
```

Or compute it on the fly from `richText` length in the card component.

No other schema changes — title, slug, tag (categories), and date are already
there.

---

## 4. Newsletter — Subscribe block

If your existing `Subscribe` block already covers heading + body + CTA label +
"X readers" stat, no change needed. If not:

```ts
// src/blocks/Subscribe/config.ts
{ name: 'eyebrow', type: 'text' },         // "— Newsletter"
{ name: 'heading', type: 'text' },         // "Field notes from…"
{ name: 'body', type: 'textarea' },
{ name: 'inputPlaceholder', type: 'text' },
{ name: 'buttonLabel', type: 'text' },
{ name: 'meta', type: 'text' },            // "827 READERS · MONTHLY · UNSUBSCRIBE WHENEVER"
```

---

## 5. Testimonials — small layout tweak

`src/blocks/Testimonials/Component.tsx` already has all the fields. Two visual
changes:

- Wrap the existing 3-up grid; second card uses the **primary** background
  (ember) and inverts text. Add a `featured` boolean on each testimonial
  array entry, or just hard-code "card index 1 = featured" if you don't want
  another field.
- Replace the `<figcaption>` `border-top: 1px solid var(--primary-light)` with
  a top accent rule on each `<figure>` instead of bottom — and pull the giant
  `“` into the figure as a real glyph.

### Optional new field

```ts
{ name: 'featured', type: 'checkbox' },    // styles this quote as the colored center pop
```

---

## 6. Footer

Existing footer is fine; just ensure the `<Logo>` swap to `<Mark>` from §0
applies. The current copyright + links + "1 Issue" indicator can stay.

---

## Page composition (Pages collection)

The home `Page` document's `layout` array becomes:

1. `landingImpact` hero (from §1)
2. `services` block — `layout: bento` (from §2)
3. `archive` block — recent posts, limit 3 (from §3)
4. `subscribe` block (from §4)
5. `testimonials` block (from §5)

No change to `RenderBlocks.tsx` — it dispatches by `blockType` already.

---

## CSS — global tokens

Everything I built uses your existing `globals.css` tokens. The two genuinely
new pieces of CSS are:

- `@keyframes swap` (word rotator), `@keyframes marquee` (ticker),
  `@keyframes spin` and `@keyframes pulse` (mark) — add to the bottom of
  `globals.css`.
- `.bento-tile`, `.svc-row`, `.tag` utility classes — or inline as Tailwind
  classes if you prefer (`grid grid-cols-6 gap-4` etc.).

The ember accent is just a new entry on your existing primary scale — define
once in `globals.css` and gate it with `[data-theme]` if you want users to
flip it. If ember is the new permanent brand color, replace the cyan oklch
values in `--primary-*` directly.

---

## Order I'd build in

1. `<Mark>` component + swap into header/footer (instant visual lift).
2. Hero — most distinctive change, highest visible impact.
3. Services bento — biggest schema change, do it once and the page is 80% there.
4. Posts card refresh.
5. Testimonials styling.
6. Newsletter polish.

Each step is shippable on its own — the page degrades gracefully if you mix
old and new sections during the migration.

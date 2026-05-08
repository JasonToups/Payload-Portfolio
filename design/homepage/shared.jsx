/* global React */
const { useState, useEffect, useRef } = React;

/* ─── Sample content ──────────────────────────────────────────────────── */

const services = [
  {
    n: '01',
    title: 'Company Impact',
    desc: 'How my work moved revenue, retention, and the product roadmap. The wide-view of the value I add to a business.',
    tags: ['Strategy', 'Product'],
  },
  {
    n: '02',
    title: 'Software Production',
    desc: 'How I plug into Product, Design, and Infrastructure teams. Where I sit in your release pipeline and how that shows up in shipped work.',
    tags: ['Process', 'Cross-functional'],
  },
  {
    n: '03',
    title: 'Developer Support',
    desc: 'How my work raises the floor for the engineers I work with. DX, tooling, and the unglamorous fixes that pay back compounding interest.',
    tags: ['DX', 'Tooling'],
  },
];

const posts = [
  {
    title: 'Testing SEO Title and Description',
    desc: "Here's some content about seo and how a portfolio earns its slot in the search results.",
    tag: 'react',
    date: '04.18.26',
    accent: 'a',
  },
  {
    title: 'React Post New Two',
    desc: "Here's the body for a new Post about React. This whole project was built in React, with Payload CMS.",
    tag: 'react · seo',
    date: '04.06.26',
    accent: 'b',
  },
  {
    title: 'React Post New',
    desc: 'A short take on what changed in the latest releases and what it means for the way we ship UI.',
    tag: 'react',
    date: '03.22.26',
    accent: 'c',
  },
];

const testimonials = [
  {
    quote: "I'd love a nap, do you have a pillow?",
    author: 'Your Mom',
    role: 'Mother, House of Tired',
  },
  {
    quote: 'Is this even real?',
    author: 'Anon',
    role: 'Antagonist, LinkedIn',
  },
  {
    quote: 'Jason rewired how our team thinks about the gap between design and engineering.',
    author: 'A. Reviewer',
    role: 'Head of Product, Acme',
  },
];

/* ─── Animated mark — original "JT" monogram inside an orbit ──────────── */

function Mark({ size = 32 }) {
  return (
    <span className="mark-orbit" style={{ fontSize: size }}>
      <svg viewBox="-50 -50 100 100" aria-hidden="true">
        <circle className="ring ring-1" cx="0" cy="0" r="42" />
        <g className="ring ring-2">
          <circle cx="0" cy="0" r="32" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 6" style={{ stroke: 'var(--primary)' }} />
          <circle cx="32" cy="0" r="3" fill="var(--primary)" />
        </g>
        <g className="core">
          <path
            d="M -14 -14 L 14 -14 L 14 -8 L 4 -8 L 4 14 L -2 14 L -2 -8 L -14 -8 Z"
            fill="var(--primary)"
            transform="translate(0,0) scale(0.85)"
          />
        </g>
      </svg>
    </span>
  );
}

/* ─── Shared header (pill nav) ────────────────────────────────────────── */

function PillHeader({ accent }) {
  return (
    <header style={{ padding: '1.5rem 2rem' }}>
      <div className="pill-nav" style={{ maxWidth: 760, margin: '0 auto' }}>
        <a style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--primary-on-bg)', fontWeight: 600, fontSize: '1rem' }}>
          <Mark size={28} />
          <span>Jason Toups</span>
        </a>
        <nav style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', fontSize: '0.9375rem' }}>
          <a className="under-link" style={{ color: 'var(--foreground)' }}>Work</a>
          <a className="under-link" style={{ color: 'var(--foreground)' }}>Posts</a>
          <a className="under-link" style={{ color: 'var(--foreground)' }}>Contact</a>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>SF · 06:42</span>
        </nav>
      </div>
    </header>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Foot() {
  return (
    <footer className="foot">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          <Mark size={28} />
          <span className="font-display" style={{ fontWeight: 700, fontSize: '1.125rem', color: 'inherit' }}>Jason Toups</span>
        </div>
        <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--neutral-450)', letterSpacing: '0.08em' }}>
          © 2026 — DESIGN ENGINEER FOR HIRE
        </p>
      </div>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-end', alignItems: 'flex-end', fontSize: '0.875rem', color: 'var(--neutral-350)' }}>
        <a className="under-link">Posts</a>
        <a className="under-link">Contact</a>
        <a className="under-link">Source</a>
        <a className="under-link">RSS</a>
      </div>
    </footer>
  );
}

/* ─── Newsletter ribbon ───────────────────────────────────────────────── */

function NewsletterRibbon() {
  return (
    <section style={{ padding: '6rem 3rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <span className="text-label" style={{ color: 'var(--primary-on-bg)' }}>— Newsletter</span>
          <h3 className="text-headline" style={{ marginTop: '1rem' }}>
            Field notes from the<br />engineer / designer seam.
          </h3>
        </div>
        <div>
          <p className="text-body" style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', maxWidth: '36ch' }}>
            One letter a month on shipping, hiring, and the work that sits between teams. No spam, no ladder content.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 480 }}>
            <input
              type="email"
              placeholder="you@studio.com"
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
                color: 'var(--foreground)',
                fontFamily: 'inherit',
                fontSize: '0.9375rem',
              }}
            />
            <button className="btn-primary">Subscribe →</button>
          </div>
          <p className="font-mono" style={{ fontSize: '0.6875rem', marginTop: '0.875rem', color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
            827 READERS · MONTHLY · UNSUBSCRIBE WHENEVER
          </p>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  services, posts, testimonials,
  Mark, PillHeader, Foot, NewsletterRibbon,
});

/* global React, Mark, PillHeader, Foot, NewsletterRibbon, services, posts, testimonials */

function V2Kinetic() {
  return (
    <div className="page" data-screen-label="V2 Kinetic">

      <PillHeader />

      {/* ─── HERO ─── kinetic word swap + diagonal ─── */}
      <section style={{ position: 'relative', padding: '5rem 3rem 3rem', overflow: 'hidden' }}>
        <div className="blob blob-a" style={{ width: 520, height: 520, top: -160, left: '40%' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <span className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}>NOW HIRING ME — INDEX</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}>v.26.05.07</span>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', fontWeight: 700 }}>
            <span style={{ display: 'block' }}>I&nbsp;build&nbsp;
              <span className="kinetic" style={{ fontStyle: 'italic', color: 'var(--primary-on-bg)' }}>software</span>
            </span>
            <span style={{ display: 'block', paddingLeft: '6vw' }}>that earns its</span>
            <span style={{ display: 'block', paddingLeft: '12vw' }}>place on the&nbsp;
              <span className="word-swap">
                <span>roadmap.</span>
                <span>balance sheet.</span>
                <span>team chat.</span>
              </span>
            </span>
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '4rem', alignItems: 'flex-start' }}>
            <p className="text-body" style={{ color: 'var(--muted-foreground)', fontSize: '1.0625rem', maxWidth: '38ch' }}>
              I'm Jason — a design engineer who treats portfolios like a brief, not a brag. Twelve years of shipping the seam where Product, Design and Eng meet.
            </p>
            <div />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ justifyContent: 'space-between', width: '100%' }}>
                <span>Start a conversation</span>
                <span>→</span>
              </button>
              <button className="btn-ghost" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>Read the work</span>
                <span style={{ color: 'var(--muted-foreground)' }}>↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Marquee under hero */}
        <div className="marquee" style={{ marginTop: '6rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
          {Array.from({ length: 2 }).map((_, j) => (
            <div className="marquee-track" key={j}>
              {['React', '· Next.js', '· Payload CMS', '· TypeScript', '· Postgres', '· Design Systems', '· Motion', '· Hiring', '· Product Strategy', '· DX'].map((w, i) => (
                <span key={i} className="font-display" style={{ fontWeight: 500, fontSize: '2.5rem', color: i % 3 === 0 ? 'var(--primary-on-bg)' : 'var(--foreground)', fontStyle: i % 3 === 0 ? 'italic' : 'normal' }}>{w}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT I DO ─── BENTO grid ─── */}
      <section style={{ padding: '6rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', alignItems: 'flex-end' }}>
          <div>
            <span className="text-label" style={{ color: 'var(--primary-on-bg)' }}>— What I do</span>
            <h2 className="text-headline" style={{ marginTop: '1rem' }}>
              The lanes,<br />in plain English.
            </h2>
          </div>
          <p className="text-body" style={{ fontSize: '1.0625rem', color: 'var(--muted-foreground)', maxWidth: '48ch', justifySelf: 'flex-end' }}>
            Three lanes I work in. Tap one to see how it shows up in real engagements — including who I report to, what I ship, and how we measure it.
          </p>
        </div>

        <div className="bento">
          {/* Big tile #1 */}
          <div className="bento-tile" style={{ gridColumn: 'span 4', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="num">01 / COMPANY IMPACT</span>
              <Mark size={32} />
            </div>
            <div>
              <h3 className="text-headline" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{services[0].title}</h3>
              <p style={{ fontSize: '1.0625rem', color: 'var(--muted-foreground)', maxWidth: '52ch' }}>{services[0].desc}</p>
            </div>
          </div>

          {/* Book CTA tile — colored, prominent */}
          <div className="bento-tile" style={{ gridColumn: 'span 2', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="num" style={{ color: 'var(--primary-foreground)', opacity: 0.7 }}>— Book a slot</span>
              <span className="font-mono" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.85 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 2s ease-in-out infinite' }} />
                3 SLOTS · MAY
              </span>
            </div>
            <div>
              <h3 className="font-display" style={{ fontWeight: 600, fontSize: '1.875rem', lineHeight: 1.05, letterSpacing: '-0.015em', marginBottom: '0.75rem' }}>
                Book some time.
              </h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, opacity: 0.85, marginBottom: '1.5rem' }}>
                30 minutes, no slide deck. Tell me your problem and I'll tell you whether I'm the right hire.
              </p>
              <button style={{ background: 'var(--neutral-900)', color: 'var(--neutral-50)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Open calendar <span>→</span>
              </button>
            </div>
          </div>

          {/* Tile #2 */}
          <div className="bento-tile" style={{ gridColumn: 'span 2', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span className="num">02 / SOFTWARE PRODUCTION</span>
            <div>
              <h3 className="text-title" style={{ marginBottom: '0.75rem' }}>{services[1].title}</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>{services[1].desc}</p>
            </div>
          </div>

          {/* Tile #3 */}
          <div className="bento-tile" style={{ gridColumn: 'span 2', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span className="num">03 / DEVELOPER SUPPORT</span>
            <div>
              <h3 className="text-title" style={{ marginBottom: '0.75rem' }}>{services[2].title}</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>{services[2].desc}</p>
            </div>
          </div>

          {/* "Currently Building" tile — dark, live feel */}
          <div className="bento-tile" style={{ gridColumn: 'span 2', minHeight: 280, background: 'var(--neutral-900)', color: 'var(--neutral-100)', borderColor: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="num" style={{ color: 'var(--primary)' }}>— Currently building</span>
              <span className="font-mono" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)', animation: 'pulse 1.6s ease-in-out infinite' }} />
                LIVE · WK 19
              </span>
            </div>
            <div>
              <h3 className="font-display" style={{ fontWeight: 600, fontSize: '1.5rem', color: 'var(--neutral-50)', letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1rem' }}>
                Broadcasts → Resend pipeline for the CMS.
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--neutral-350)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>✓</span>
                  Authoring in Lexical, send via Resend
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>✓</span>
                  Per-topic subscriber routing
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', opacity: 0.6 }}>
                  <span style={{ color: 'var(--neutral-450)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>○</span>
                  Live preview in admin
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT POSTS ─── 3 hover-rich cards ─── */}
      <section style={{ padding: '6rem 3rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
          <div>
            <span className="text-label" style={{ color: 'var(--primary-on-bg)' }}>— Posts</span>
            <h2 className="text-headline" style={{ marginTop: '1rem' }}>Latest dispatch</h2>
          </div>
          <a className="under-link font-mono" style={{ fontSize: '0.875rem' }}>ALL POSTS →</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          {posts.map((p, i) => (
            <article key={p.title} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="thumb" style={{ aspectRatio: '4 / 3' }}>
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', background: 'color-mix(in oklch, var(--background) 80%, transparent)', backdropFilter: 'blur(6px)', borderRadius: '4px', letterSpacing: '0.08em' }}>NO. 0{i + 1}</span>
                </div>
              </div>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <span className="tag">{p.tag}</span>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>{p.date}</span>
                </div>
                <h3 className="font-display" style={{ fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)', lineHeight: 1.55, flex: 1 }}>{p.desc}</p>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>4 MIN READ</span>
                  <span style={{ color: 'var(--primary-on-bg)' }}>→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <NewsletterRibbon />

      {/* ─── TESTIMONIALS ─── stacked w/ rule ─── */}
      <section style={{ padding: '6rem 3rem' }}>
        <div style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'flex-end' }}>
          <div>
            <span className="text-label" style={{ color: 'var(--primary-on-bg)' }}>— Receipts</span>
            <h2 className="text-headline" style={{ marginTop: '1rem' }}>What people say</h2>
          </div>
          <p className="text-body" style={{ color: 'var(--muted-foreground)', fontSize: '1.0625rem', maxWidth: '52ch' }}>
            Lightly edited. Written without me in the room. Names available on request.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          {testimonials.map((t, i) => (
            <figure key={i} style={{ borderTop: '1px solid var(--primary-on-bg)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <blockquote className="font-display" style={{ fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                “{t.quote}”
              </blockquote>
              <figcaption style={{ marginTop: 'auto' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.author}</div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em', marginTop: '0.25rem' }}>{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Foot />
    </div>
  );
}

window.V2Kinetic = V2Kinetic;

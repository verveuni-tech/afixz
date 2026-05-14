import React from 'react';
import { ArrowRight } from 'lucide-react';
import useSeo from '../hooks/useSeo';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://afixz.com';

const stats = [
  { value: '37+', label: 'Services available' },
  { value: '4', label: 'Specialist categories' },
  { value: '3', label: 'Cities covered' },
  { value: '100%', label: 'Vetted professionals' },
];

const values = [
  {
    n: '01',
    title: 'Show up. Every time.',
    body: `We built AfixZ because "he'll come tomorrow" isn't good enough. Every booking is a commitment — from us, and from our professionals.`,
  },
  {
    n: '02',
    title: 'Transparent pricing. No surprises.',
    body: 'You see the price before you book. No on-site negotiations, no add-ons, no awkward conversations. What\'s shown is what you pay.',
  },
  {
    n: '03',
    title: 'Skill, not just availability.',
    body: 'We verify every professional before they work on your home. Background-checked, category-trained, rated by real customers after every visit.',
  },
  {
    n: '04',
    title: 'Your home. Our responsibility.',
    body: 'If the work falls short, we make it right. Every service on AfixZ comes with a satisfaction guarantee — no fine print.',
  },
];

const categories = [
  { slug: 'garden-and-landscaping', label: 'Garden & Landscaping' },
  { slug: 'mechanic', label: 'Mechanic' },
  { slug: 'interior', label: 'Interior' },
  { slug: 'fabrication', label: 'Fabrication' },
];

const AboutUs: React.FC = () => {
  useSeo({
    title: 'About Us | AfixZ — Home Services Platform',
    description:
      'AfixZ connects Delhi NCR homeowners with verified, accountable home service professionals — garden care, mechanic, interior, and fabrication.',
    canonicalUrl: `${SITE_URL}/about`,
    keywords: ['about afixz', 'home services Delhi NCR', 'verified professionals', 'reliable home services'],
  });

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .anim-d1 { animation-delay: 0.05s; }
        .anim-d2 { animation-delay: 0.15s; }
        .anim-d3 { animation-delay: 0.25s; }
        .anim-d4 { animation-delay: 0.35s; }
        .cat-item { transition: padding-left 0.25s cubic-bezier(0.22,1,0.36,1); }
        .cat-item:hover { padding-left: 1.5rem; }
        .cat-item:hover .cat-arrow { opacity: 1; transform: translateX(0); }
        .cat-arrow { opacity: 0; transform: translateX(-6px); transition: opacity 0.25s, transform 0.25s; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-primary min-h-[88vh] flex flex-col justify-center px-6 pt-20 pb-16 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-5xl">
          <p className="anim anim-d1 mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            About AfixZ
          </p>

          <h1
            className="anim anim-d2 text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Broken promises<br />
            <span style={{ color: 'var(--color-accent)' }}>stop here.</span>
          </h1>

          <p className="anim anim-d3 mt-8 max-w-xl text-lg leading-relaxed text-white/55"
             style={{ fontFamily: 'var(--font-sans)' }}>
            AfixZ connects Delhi NCR homeowners with verified, accountable professionals — for every fix, from garden to gate.
          </p>

          <div className="anim anim-d4 mt-12 h-px w-16 bg-white/20" />
        </div>
      </section>

      {/* ── DECLARATION ──────────────────────────────────────── */}
      <section className="border-b border-slate-100 px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p
            className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold leading-tight text-slate-900 max-w-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            We're building the most reliable home services network in Delhi NCR —
            {' '}<span style={{ color: 'var(--color-accent)' }}>one guaranteed visit at a time.</span>
          </p>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 md:px-16 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {stats.map((s) => (
              <div key={s.label} className="py-12 px-6 first:pl-0 last:pr-0">
                <p
                  className="text-5xl font-black leading-none text-slate-900"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-[1fr_1.4fr] md:gap-20 items-start">

            {/* Pull quote */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                How we started
              </p>
              <blockquote
                className="text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-slate-900 italic"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                "Finding a reliable professional shouldn't feel like a gamble."
              </blockquote>
              <div className="mt-8 h-0.5 w-12" style={{ background: 'var(--color-accent)' }} />
            </div>

            {/* Body */}
            <div className="space-y-6 text-[1.05rem] leading-relaxed text-slate-600">
              <p>
                AfixZ was born from a real frustration. Hours spent calling contractors who don't show up. Negotiating prices at the door. Work done halfway. No accountability, no recourse.
              </p>
              <p>
                We built a platform where every professional is vetted before their first job, every price is fixed before you book, and every visit comes with a guarantee. Not a promise — a guarantee.
              </p>
              <p>
                We started in Delhi NCR because this is home. Garden care in Noida, bike mechanic in Gurgaon, interior work in Delhi — we know what's needed here, and we're building it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ───────────────────────────────────────── */}
      <section className="bg-primary px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            What we do
          </p>
          <div className="divide-y divide-white/10">
            {categories.map((cat, i) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="cat-item group flex items-center justify-between py-6"
              >
                <div className="flex items-center gap-6">
                  <span
                    className="text-xs font-mono tabular-nums"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-white"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cat.label}
                  </span>
                </div>
                <ArrowRight
                  size={20}
                  className="cat-arrow shrink-0 text-white/60"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            What we believe
          </p>
          <h2
            className="mb-14 text-3xl font-black text-slate-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our commitments to you
          </h2>

          <div>
            {values.map((v, i) => (
              <div
                key={v.n}
                className={`grid grid-cols-[3.5rem_1fr] gap-8 py-10 ${
                  i < values.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span
                  className="text-4xl font-black leading-none tabular-nums pt-0.5"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
                >
                  {v.n}
                </span>
                <div>
                  <h3
                    className="text-xl font-bold text-slate-900 mb-3"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed max-w-xl">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-accent)' }} className="px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-white max-w-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your next fix,<br />sorted in 60 seconds.
          </h2>
          <a
            href="/services"
            className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg shrink-0"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            Browse Services
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;

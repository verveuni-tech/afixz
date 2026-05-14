import React, { useState } from 'react';
import useSeo from '../hooks/useSeo';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <p>
        By accessing or using AfixZ, you agree to be bound by these Terms of Service. If you do not agree, do not use our platform.
      </p>
    ),
  },
  {
    id: 'use',
    title: 'Use of the Platform',
    content: (
      <p>
        AfixZ provides a marketplace connecting customers with service professionals. You agree to use the platform only for lawful purposes. You must not misuse, reverse-engineer, or attempt to gain unauthorized access to any part of the platform.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    content: (
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.
      </p>
    ),
  },
  {
    id: 'bookings',
    title: 'Bookings and Payments',
    content: (
      <p>
        When you book a service, you agree to pay the stated price. All payments are processed securely. Cancellation and refund policies are defined per service and displayed at checkout.
      </p>
    ),
  },
  {
    id: 'providers',
    title: 'Service Providers',
    content: (
      <p>
        AfixZ vets service providers but does not employ them directly. AfixZ is not liable for the quality, safety, or outcome of work performed by providers. Disputes between customers and providers should be reported to our support team.
      </p>
    ),
  },
  {
    id: 'prohibited',
    title: 'Prohibited Conduct',
    content: (
      <ul className="space-y-2">
        {[
          'Posting false, misleading, or fraudulent reviews',
          'Harassing or threatening providers or other users',
          'Circumventing platform fees by transacting off-platform',
          'Using automated tools to scrape or abuse the platform',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    content: (
      <p>
        All content on AfixZ — including logos, text, and code — is owned by AfixZ or its licensors. You may not reproduce or distribute any content without written permission.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: (
      <p>
        AfixZ is not liable for indirect, incidental, or consequential damages arising from use of the platform. Our total liability shall not exceed the amount paid by you for the relevant service.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    content: (
      <p>
        We reserve the right to suspend or terminate your account for violations of these terms. You may close your account at any time by contacting support.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing Law',
    content: (
      <p>
        These terms are governed by applicable laws. Any disputes shall be resolved through binding arbitration or the appropriate courts in your jurisdiction.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Questions?{' '}
        <a href="mailto:support@afixz.com" className="font-medium text-primary underline underline-offset-2">
          support@afixz.com
        </a>
      </p>
    ),
  },
];

const TermsOfService: React.FC = () => {
  const [active, setActive] = useState('acceptance');

  useSeo({
    title: 'Terms of Service | AfixZ',
    description: "Read AfixZ's Terms of Service — the rules and conditions governing your use of our platform.",
    canonicalUrl: `${import.meta.env.VITE_SITE_URL || 'https://afixz.com'}/terms`,
    robots: 'noindex, follow',
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-3 text-slate-500">Last updated: May 2025</p>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex gap-12">

          {/* Sidebar nav — desktop only */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Contents</p>
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active === s.id
                      ? 'bg-slate-100 font-medium text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <h2 className="text-xl font-semibold text-slate-900">{s.title}</h2>
                </div>
                <div className="pl-10 leading-relaxed text-slate-600">
                  {s.content}
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default TermsOfService;

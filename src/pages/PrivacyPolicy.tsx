import React, { useState } from 'react';
import useSeo from '../hooks/useSeo';

const sections = [
  {
    id: 'collection',
    title: 'Information We Collect',
    content: (
      <p>
        We collect information you provide directly — name, phone number, email address, and location — when you register or book a service. We also collect usage data such as pages visited, device type, and IP address to improve our platform.
      </p>
    ),
  },
  {
    id: 'use',
    title: 'How We Use Your Information',
    content: (
      <ul className="space-y-2">
        {[
          'To process bookings and deliver services',
          'To communicate order confirmations, updates, and support',
          'To improve our platform, features, and user experience',
          'To send promotional offers (you may opt out at any time)',
          'To comply with legal obligations',
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
    id: 'sharing',
    title: 'Sharing Your Information',
    content: (
      <p>
        We share your information with service providers only to the extent necessary to fulfill your booking. We do not sell your personal data to third parties. We may share data with payment processors, analytics providers, and legal authorities when required by law.
      </p>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content: (
      <p>
        We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: (
      <p>
        We use cookies and similar technologies to remember your preferences, analyze traffic, and personalize your experience. You can control cookie settings through your browser preferences.
      </p>
    ),
  },
  {
    id: 'rights',
    title: 'Your Rights',
    content: (
      <p>
        You have the right to access, correct, or delete your personal information. You may also object to certain types of processing. To exercise these rights, contact us at{' '}
        <a href="mailto:support@afixz.com" className="font-medium text-primary underline underline-offset-2">
          support@afixz.com
        </a>.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <p>
        We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of AfixZ after changes constitutes acceptance of the new policy.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <p>
        Questions about this policy? Reach us at{' '}
        <a href="mailto:support@afixz.com" className="font-medium text-primary underline underline-offset-2">
          support@afixz.com
        </a>.
      </p>
    ),
  },
];

const PrivacyPolicy: React.FC = () => {
  const [active, setActive] = useState('collection');

  useSeo({
    title: 'Privacy Policy | AfixZ',
    description: "Read AfixZ's Privacy Policy — how we collect, use, and protect your personal data.",
    canonicalUrl: `${import.meta.env.VITE_SITE_URL || 'https://afixz.com'}/privacy`,
    robots: 'noindex, follow',
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
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

export default PrivacyPolicy;

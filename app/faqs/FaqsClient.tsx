'use client';

import React, { useState } from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { faqsData } from './faqsData';

export default function FaqsClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl leading-relaxed">
            Find answers to common questions regarding Grove PMS features, multi-property architecture, billing, data
            isolation, and hotel onboarding.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-border-subtle overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-brand-forest hover:text-brand-forest-light transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-forest' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-border-subtle/50 mt-1">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-brand-forest text-white text-center sm:flex sm:items-center sm:justify-between sm:text-left gap-6 shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl">Still have questions about Grove PMS?</h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1">Our hotel onboarding specialists are ready to help you configure your property.</p>
          </div>
          <Link
            href="/contact"
            className="inline-block mt-4 sm:mt-0 bg-white text-brand-forest font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all hover:bg-brand-sand shadow-2xs shrink-0"
          >
            Contact Sales & Support →
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

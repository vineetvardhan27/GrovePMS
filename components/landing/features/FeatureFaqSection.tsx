'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FeatureFaqSectionProps {
  moduleName: string;
  faqs: FaqItem[];
}

export default function FeatureFaqSection({ moduleName, faqs }: FeatureFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
          Frequently Asked Questions
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
          Common Questions About Grove {moduleName}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/10 shadow-[0_2px_8px_rgba(20,28,26,0.02)] overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#142320] hover:text-brand-forest transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-brand-forest' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-[#1C2D29]/6 pt-3 animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


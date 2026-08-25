'use client';

import React, { useState } from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Mail, MessageSquare, Building2, PhoneCall, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    hotelName: '',
    email: '',
    phone: '',
    category: 'sales',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl leading-relaxed">
            Have questions about onboarding your hotel, multi-property pricing, custom integrations, or technical
            support? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Channels */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-border-subtle">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">Sales & Onboarding</h3>
              <p className="text-xs text-ink-muted mt-1">For new property setups & product demonstrations.</p>
              <a
                href="mailto:sales@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                sales@grovepms.com
              </a>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-subtle">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">Technical Support</h3>
              <p className="text-xs text-ink-muted mt-1">For active hotel operators, managers, and staff.</p>
              <a
                href="mailto:support@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                support@grovepms.com
              </a>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-subtle">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">General & Legal</h3>
              <p className="text-xs text-ink-muted mt-1">For privacy, compliance, and partnership queries.</p>
              <a
                href="mailto:hello@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                hello@grovepms.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-border-subtle p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-status-green/10 text-status-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-brand-forest">Message Received</h3>
                <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                  Thank you for reaching out. Our team will review your inquiry and get back to you at{' '}
                  <span className="font-semibold text-ink">{formState.email}</span> within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({
                      name: '',
                      hotelName: '',
                      email: '',
                      phone: '',
                      category: 'sales',
                      message: '',
                    });
                  }}
                  className="mt-4 text-xs font-semibold text-brand-forest hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Hotel / Property Name</label>
                    <input
                      type="text"
                      required
                      value={formState.hotelName}
                      onChange={(e) => setFormState({ ...formState, hotelName: e.target.value })}
                      placeholder="e.g. Greenery View Resort"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@hotel.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Inquiry Type</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                  >
                    <option value="sales">New Hotel Setup / Sales Demo</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Pricing Query</option>
                    <option value="legal">Privacy & Compliance</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Tell us about your property, room count, or specific requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xs"
                >
                  <span>Submit Inquiry</span>
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

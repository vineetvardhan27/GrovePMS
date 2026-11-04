'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Turnstile, TurnstileRef } from '@/components/shared/Turnstile';
import {
  Mail,
  MessageSquare,
  Building2,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight,
  Headphones,
  Hotel,
  CalendarCheck,
} from 'lucide-react';

interface FormState {
  name: string;
  hotelName: string;
  email: string;
  phone: string;
  category: 'sales' | 'support' | 'billing' | 'legal' | 'other';
  subject: string;
  message: string;
}

const initialFormState: FormState = {
  name: '',
  hotelName: '',
  email: '',
  phone: '',
  category: 'sales',
  subject: '',
  message: '',
};

export default function ContactClient() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    subject: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const turnstileRef = useRef<TurnstileRef>(null);

  // Clear specific field error on change
  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (apiError) setApiError(null);
  };

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.name.trim()) {
      errors.name = 'Please enter your full name.';
    } else if (formState.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(formState.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@hotel.com).';
    }

    if (!formState.subject.trim()) {
      errors.subject = 'Please enter an inquiry subject.';
    } else if (formState.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters.';
    }

    if (!formState.message.trim()) {
      errors.message = 'Please provide details about your inquiry.';
    } else if (formState.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }

    if (formState.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;
      if (!phoneRegex.test(formState.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (e.g. +91 98765 43210).';
      }
    }

    if (!captchaToken) {
      setCaptchaError('Please complete the security verification before submitting.');
      errors.captcha = 'Security verification required.';
    } else {
      setCaptchaError(null);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyCaptcha = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.captcha;
      return next;
    });
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaError('Verification challenge expired. Please check the box again.');
  }, []);

  const handleCaptchaError = useCallback((code?: string) => {
    setCaptchaToken(null);
    let message = 'Verification check encountered an error. Please click Reload below.';
    if (code === 'SCRIPT_LOAD_FAILED' || code === '200500' || code === '600010') {
      message = 'Verification blocked by browser. If using Brave Shields, AdBlock, or a VPN, please pause it for localhost or click Reload.';
    } else if (code === '110200') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      message = `Domain "${currentHost}" is not authorized for this Turnstile site key. Please add "${currentHost}" to Allowed Domains in your Cloudflare dashboard.`;
    } else if (code === '110600' || code === '110620' || code === 'SCRIPT_LOAD_TIMEOUT') {
      message = 'Verification challenge timed out. Please check your internet connection and reload.';
    }
    setCaptchaError(message);
  }, []);

  const handleReloadCaptcha = useCallback(() => {
    setCaptchaError(null);
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (isSubmitting) return;

    if (!validateClientSide()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          hotelName: formState.hotelName,
          email: formState.email,
          phone: formState.phone,
          category: formState.category,
          subject: formState.subject,
          message: formState.message,
          captchaToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setApiError(data.error || 'Failed to send your message. Please try again.');

        if (data.errorCode === 'CAPTCHA_FAILED' || data.errorCode?.includes('CAPTCHA')) {
          setCaptchaToken(null);
          turnstileRef.current?.reset();
          setCaptchaError('CAPTCHA verification failed. Please try again.');
        }

        setIsSubmitting(false);
        return;
      }

      setSubmittedData({
        name: formState.name,
        email: formState.email,
        subject: formState.subject,
      });
      setFormState(initialFormState);
      setFieldErrors({});
      setCaptchaToken(null);
      setCaptchaError(null);
      turnstileRef.current?.reset();
    } catch (err: any) {
      console.error('[ContactPage] Network error during submission:', err);
      setApiError('Unable to connect to the server. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormState(initialFormState);
    setFieldErrors({});
    setCaptchaToken(null);
    setCaptchaError(null);
    setApiError(null);
    turnstileRef.current?.reset();
  };

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
      {/* Subtle architectural grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85"
        aria-hidden="true"
      />

      {/* Soft Ambient Forest Flare */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] -z-10 blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(29, 64, 58, 0.12) 0%, rgba(29, 64, 58, 0.02) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* ── HERO HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-5 shadow-2xs">
            <Image
              src="/Grove.png"
              alt="Grove Logo"
              width={16}
              height={16}
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Grove PMS — Direct Hospitality Concierge</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-black tracking-tight leading-[1.12]">
            Let&apos;s Talk Hospitality.
            <br />
            Connect with Grove Specialists.
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Whether you&apos;re looking to modernize front desk operations, inquire about white-glove setup, or need technical assistance—our team is ready.
          </p>

          {/* Quick SLA Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-ink-muted font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-status-green" />
              <span>Response Time &lt; 2 Hours</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-status-green" />
              <span>Dedicated Property Specialist</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
              <span>100% Confidential</span>
            </span>
          </div>
        </div>

        {/* ── TWO-COLUMN MAIN CONTENT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 5-COL: Contact Channels & Operational Context */}
          <div className="lg:col-span-5 space-y-4">
            {/* Channel 1: Sales & Demos */}
            <div className="rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 shadow-[0_6px_24px_rgba(20,28,26,0.03)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif font-bold text-base text-[#142320]">
                      Sales &amp; Property Demos
                    </h2>
                    <span className="text-[10px] font-bold text-status-green uppercase bg-status-green/10 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Personalized 20-minute operational walkthrough tailored to your room count and property layout.
                  </p>
                  <a
                    href="mailto:sales@grovepms.com"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-2.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>sales@grovepms.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Channel 2: Technical Support */}
            <div className="rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 shadow-[0_6px_24px_rgba(20,28,26,0.03)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif font-bold text-base text-[#142320]">
                      Technical &amp; Night Audit Support
                    </h2>
                    <span className="text-[10px] font-bold text-[#2B6CB0] uppercase bg-[#2B6CB0]/10 px-2 py-0.5 rounded-full">
                      24/7 Priority
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Fast response support for active hotel front desk staff, managers, and night auditors.
                  </p>
                  <a
                    href="mailto:support@grovepms.com"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-2.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>support@grovepms.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Channel 3: White-Glove Migration Assistance */}
            <div className="rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 shadow-[0_6px_24px_rgba(20,28,26,0.03)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
                  <Hotel className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif font-bold text-base text-[#142320]">
                    White-Glove Implementation
                  </h2>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Migrating from legacy on-premise software? Our specialists handle your complete room matrix and past guest import.
                  </p>
                  <a
                    href="mailto:hello@grovepms.com"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-2.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>hello@grovepms.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Property Trust Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1D403A] to-[#122A26] text-white p-5 sm:p-6 shadow-[0_12px_32px_rgba(20,40,36,0.18)] border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-brand-sand text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-status-green" />
                <span>The Grove Assurance</span>
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Engineered for Serious Hoteliers
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                From 12-room boutique heritage homestays in Himachal and Kerala to 80-room resort properties, Grove simplifies your daily operations without bloat.
              </p>
            </div>
          </div>

          {/* RIGHT 7-COL: Glassmorphic Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_24px_70px_-12px_rgba(20,38,34,0.10),0_0_0_1px_rgba(28,45,41,0.04)] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              {/* Specular Highlight Top Edge */}
              <div
                className="pointer-events-none absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
                aria-hidden="true"
              />

              {submittedData ? (
                /* Success Confirmation View */
                <div className="text-center py-10 px-4 space-y-4 animate-fadeIn" role="status" aria-live="polite">
                  <div className="w-16 h-16 rounded-full bg-status-green/10 text-status-green flex items-center justify-center mx-auto shadow-xs border border-status-green/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-black">
                    Inquiry Received Successfully
                  </h2>
                  <div className="bg-brand-sand/40 rounded-2xl p-4 max-w-md mx-auto text-left text-xs sm:text-sm border border-[#1C2D29]/10 space-y-1.5 shadow-2xs">
                    <p className="text-ink">
                      <span className="font-semibold text-ink-muted">From:</span> {submittedData.name}
                    </p>
                    <p className="text-ink">
                      <span className="font-semibold text-ink-muted">Subject:</span> {submittedData.subject}
                    </p>
                    <p className="text-ink">
                      <span className="font-semibold text-ink-muted">Response To:</span>{' '}
                      <span className="font-semibold text-brand-forest">{submittedData.email}</span>
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. Our hospitality specialists will review your requirements and respond within 2 business hours.
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-forest text-white text-xs sm:text-sm font-semibold hover:bg-brand-forest-light transition-all shadow-xs"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Send Another Inquiry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Inquiry Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1C2D29]/8">
                    <div>
                      <h2 className="font-serif font-bold text-lg sm:text-xl text-[#142320]">
                        Send Us a Message
                      </h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Fill out the details below and an onboarding specialist will follow up promptly.
                      </p>
                    </div>
                  </div>

                  {/* General Alert / Error Banner */}
                  {apiError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-800 flex items-start gap-3 text-xs sm:text-sm animate-fadeIn"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">Unable to submit inquiry</p>
                        <p className="mt-0.5 text-red-700">{apiError}</p>
                      </div>
                    </div>
                  )}

                  {/* Name & Hotel Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block font-semibold text-ink mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        disabled={isSubmitting}
                        required
                        value={formState.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Vikram Malhotra"
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all bg-white/90 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 ${
                          fieldErrors.name
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                            : 'border-[#1C2D29]/15 focus:ring-brand-forest/15 focus:border-brand-forest shadow-2xs'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p id="contact-name-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-hotel" className="block font-semibold text-ink mb-1.5">
                        Hotel / Property Name <span className="text-ink-muted text-xs font-normal">(Optional)</span>
                      </label>
                      <input
                        id="contact-hotel"
                        type="text"
                        disabled={isSubmitting}
                        value={formState.hotelName}
                        onChange={(e) => handleChange('hotelName', e.target.value)}
                        placeholder="e.g. The Heritage Retreat"
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#1C2D29]/15 bg-white/90 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/15 focus:border-brand-forest disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="block font-semibold text-ink mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        disabled={isSubmitting}
                        required
                        value={formState.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="name@property.com"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all bg-white/90 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 ${
                          fieldErrors.email
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                            : 'border-[#1C2D29]/15 focus:ring-brand-forest/15 focus:border-brand-forest shadow-2xs'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p id="contact-email-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block font-semibold text-ink mb-1.5">
                        Phone / WhatsApp <span className="text-ink-muted text-xs font-normal">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        disabled={isSubmitting}
                        value={formState.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all bg-white/90 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 ${
                          fieldErrors.phone
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                            : 'border-[#1C2D29]/15 focus:ring-brand-forest/15 focus:border-brand-forest shadow-2xs'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p id="contact-phone-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Category & Subject Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="contact-category" className="block font-semibold text-ink mb-1.5">
                        Inquiry Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="contact-category"
                        disabled={isSubmitting}
                        value={formState.category}
                        onChange={(e) => handleChange('category', e.target.value as any)}
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#1C2D29]/15 bg-white/90 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/15 focus:border-brand-forest disabled:opacity-60 disabled:cursor-not-allowed text-ink shadow-2xs font-medium"
                      >
                        <option value="sales">New Hotel Setup / Demo</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing &amp; Subscription</option>
                        <option value="legal">Privacy &amp; Compliance</option>
                        <option value="other">General Inquiry</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="contact-subject" className="block font-semibold text-ink mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        disabled={isSubmitting}
                        required
                        value={formState.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="e.g. Inquiring about PMS onboarding for 36-room boutique hotel"
                        aria-invalid={Boolean(fieldErrors.subject)}
                        aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all bg-white/90 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 ${
                          fieldErrors.subject
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                            : 'border-[#1C2D29]/15 focus:ring-brand-forest/15 focus:border-brand-forest shadow-2xs'
                        }`}
                      />
                      {fieldErrors.subject && (
                        <p id="contact-subject-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.subject}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="contact-message" className="block font-semibold text-ink">
                        Operational Requirements / Message <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-ink-muted font-mono">
                        {formState.message.length} / 3000
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      rows={4}
                      disabled={isSubmitting}
                      required
                      value={formState.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us about your property, current software, room count, specific operational challenges, or timeline..."
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                      className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all bg-white/90 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed text-ink placeholder:text-ink-muted/50 leading-relaxed ${
                        fieldErrors.message
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-[#1C2D29]/15 focus:ring-brand-forest/15 focus:border-brand-forest shadow-2xs'
                      }`}
                    />
                    {fieldErrors.message && (
                      <p id="contact-message-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Cloudflare Turnstile Verification */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-ink flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>Security Verification</span>
                        <span className="text-red-500">*</span>
                      </label>
                      {captchaToken && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-green bg-status-green/10 px-2.5 py-0.5 rounded-full border border-status-green/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-brand-sand/30 border border-[#1C2D29]/8">
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onVerify={handleVerifyCaptcha}
                        onExpire={handleCaptchaExpire}
                        onError={handleCaptchaError}
                        theme="light"
                      />
                    </div>

                    {captchaError && (
                      <div id="contact-captcha-error" className="mt-2 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs animate-fadeIn">
                        <div className="flex items-start gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="space-y-2 flex-1">
                            <p className="font-medium leading-relaxed">{captchaError}</p>
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              <button
                                type="button"
                                onClick={handleReloadCaptcha}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-forest bg-white border border-brand-forest/20 hover:bg-brand-forest/5 rounded-lg transition-colors shadow-2xs"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reload Verification</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-serif font-bold text-base py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Your Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Inquiry to Grove Team</span>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-ink-muted text-center mt-2.5">
                      Protected by Cloudflare Turnstile. Your property data is kept strictly confidential.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── HELPFUL SHORTCUTS BAR ── */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-[#1C2D29]/8">
          <div className="rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-md border border-white/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/70 block mb-1">
                Fast-Track Actions
              </span>
              <h3 className="font-serif font-bold text-lg text-[#142320]">
                Prefer to explore independently?
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Review transparent ₹999/month pricing or launch a live trial without speaking to sales.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-brand-forest hover:bg-brand-sand/50 transition-colors shadow-2xs"
              >
                View Pricing (₹999/mo)
              </Link>
              <Link
                href="/register-hotel"
                className="px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

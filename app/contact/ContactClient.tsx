'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
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

    // Prevent duplicate submission while already processing
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

        // If CAPTCHA was invalid or expired, reset token and prompt user
        if (data.errorCode === 'CAPTCHA_FAILED' || data.errorCode?.includes('CAPTCHA')) {
          setCaptchaToken(null);
          turnstileRef.current?.reset();
          setCaptchaError('CAPTCHA verification failed. Please try again.');
        }

        setIsSubmitting(false);
        return;
      }

      // Success path: save confirmation details, reset form state and CAPTCHA
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
            Contact Grove PMS
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl leading-relaxed">
            Have questions about onboarding your hotel, multi-property pricing, custom integrations, or technical
            support? Reach out to our hospitality specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Channels */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-base text-ink">Sales & Onboarding</h2>
              <p className="text-xs text-ink-muted mt-1">For new property setups & product demonstrations.</p>
              <a
                href="mailto:sales@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                sales@grovepms.com
              </a>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-base text-ink">Technical Support</h2>
              <p className="text-xs text-ink-muted mt-1">For active hotel operators, managers, and staff.</p>
              <a
                href="mailto:support@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                support@grovepms.com
              </a>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-base text-ink">General & Partnerships</h2>
              <p className="text-xs text-ink-muted mt-1">For privacy, compliance, and enterprise queries.</p>
              <a
                href="mailto:hello@grovepms.com"
                className="text-xs font-semibold text-brand-forest hover:underline block mt-2"
              >
                hello@grovepms.com
              </a>
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-border-subtle p-6 sm:p-8 shadow-xs">
            {submittedData ? (
              /* Success Confirmation View */
              <div className="text-center py-10 px-4 space-y-4" role="status" aria-live="polite">
                <div className="w-14 h-14 rounded-full bg-status-green/10 text-status-green flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-serif font-bold text-2xl text-brand-forest">
                  Inquiry Received Successfully
                </h2>
                <div className="bg-brand-sand/30 rounded-2xl p-4 max-w-md mx-auto text-left text-xs sm:text-sm border border-border-subtle space-y-1.5">
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
                  Thank you for reaching out. Our hospitality specialists will review your requirements and respond within 1 business day.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-all shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Contact Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs sm:text-sm">
                {/* General Alert / Error Banner */}
                {apiError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs sm:text-sm"
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
                    <label htmlFor="contact-name" className="block font-semibold text-ink mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      disabled={isSubmitting}
                      required
                      value={formState.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-brand-sand/20 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.name
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-border-subtle focus:ring-brand-forest/20 focus:border-brand-forest'
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
                    <label htmlFor="contact-hotel" className="block font-semibold text-ink mb-1">
                      Hotel / Property Name <span className="text-ink-muted text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-hotel"
                      type="text"
                      disabled={isSubmitting}
                      value={formState.hotelName}
                      onChange={(e) => handleChange('hotelName', e.target.value)}
                      placeholder="e.g. Greenery View Resort"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email & Phone Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block font-semibold text-ink mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      disabled={isSubmitting}
                      required
                      value={formState.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="name@hotel.com"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-brand-sand/20 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.email
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-border-subtle focus:ring-brand-forest/20 focus:border-brand-forest'
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
                    <label htmlFor="contact-phone" className="block font-semibold text-ink mb-1">
                      Phone Number <span className="text-ink-muted text-xs font-normal">(Optional)</span>
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
                      className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-brand-sand/20 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.phone
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-border-subtle focus:ring-brand-forest/20 focus:border-brand-forest'
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
                    <label htmlFor="contact-category" className="block font-semibold text-ink mb-1">
                      Inquiry Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contact-category"
                      disabled={isSubmitting}
                      value={formState.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-brand-sand/20 focus:outline-hidden focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="sales">New Hotel Setup / Demo</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Pricing Query</option>
                      <option value="legal">Privacy & Compliance</option>
                      <option value="other">General Inquiries</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="contact-subject" className="block font-semibold text-ink mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      disabled={isSubmitting}
                      required
                      value={formState.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="e.g. Inquiring about PMS onboarding for 45-room resort"
                      aria-invalid={Boolean(fieldErrors.subject)}
                      aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-brand-sand/20 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.subject
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-border-subtle focus:ring-brand-forest/20 focus:border-brand-forest'
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
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="contact-message" className="block font-semibold text-ink">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-ink-muted">
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
                    placeholder="Tell us about your property, room count, specific operational needs, or questions..."
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors bg-brand-sand/20 focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      fieldErrors.message
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                        : 'border-border-subtle focus:ring-brand-forest/20 focus:border-brand-forest'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p id="contact-message-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.message}</span>
                    </p>
                  )}
                </div>

                {/* Security Verification (Cloudflare Turnstile) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-ink flex items-center gap-1.5 text-sm">
                      <span>Security Verification</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {captchaToken && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onVerify={handleVerifyCaptcha}
                    onExpire={handleCaptchaExpire}
                    onError={handleCaptchaError}
                    theme="light"
                  />

                  {captchaError && (
                    <div id="contact-captcha-error" className="mt-2 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs">
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
                <div className="pt-2">
                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-ink-muted text-center mt-2">
                    Protected by Cloudflare Turnstile. Your information is kept strictly confidential.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

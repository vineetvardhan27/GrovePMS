import { z } from 'zod';

/**
 * Strips HTML tags, script elements, and dangerous control characters
 * to prevent XSS and HTML injection.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script>...</script>
    .replace(/<[^>]+>/g, '') // Strip remaining HTML tags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove ASCII control characters
    .trim();
}

/**
 * Strict email validation regex conforming to standard RFC 5322 subset
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Phone number validation regex (optional, allows international format, spaces, hyphens, plus)
 */
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;

export const contactCategorySchema = z.enum([
  'sales',
  'support',
  'billing',
  'legal',
  'other',
], {
  errorMap: () => ({ message: 'Please select a valid inquiry category' }),
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .refine((val) => sanitizeInput(val).length >= 2, {
      message: 'Name must be at least 2 characters',
    }),
  email: z
    .string()
    .min(1, 'Email address is required')
    .max(255, 'Email cannot exceed 255 characters')
    .refine((val) => EMAIL_REGEX.test(val.trim()), {
      message: 'Please provide a valid email address (e.g. name@hotel.com)',
    }),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject cannot exceed 200 characters')
    .refine((val) => sanitizeInput(val).length >= 3, {
      message: 'Subject must be at least 3 characters',
    }),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(3000, 'Message cannot exceed 3000 characters')
    .refine((val) => sanitizeInput(val).length >= 10, {
      message: 'Message must be at least 10 characters long',
    }),
  hotelName: z
    .string()
    .max(120, 'Property name cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || PHONE_REGEX.test(val.trim()), {
      message: 'Please provide a valid phone number (e.g. +91 98765 43210)',
    }),
  category: contactCategorySchema.default('sales'),
  captchaToken: z
    .string({
      required_error: 'CAPTCHA verification is required. Please check the verification box.',
    })
    .min(1, 'CAPTCHA verification is required. Please check the verification box.'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export interface SanitizedContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  hotelName?: string;
  phone?: string;
  category: 'sales' | 'support' | 'billing' | 'legal' | 'other';
}

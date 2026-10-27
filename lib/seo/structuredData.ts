/**
 * Structured Data (JSON-LD) generators for Grove PMS
 * All schemas adhere strictly to schema.org specifications and Google Search Central guidelines.
 */

export const BASE_URL = 'https://www.grovepms.me';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Grove PMS',
    legalName: 'Grove Hospitality Technologies',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/Grove.png`,
      caption: 'Grove PMS Logo',
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/Grove.png`,
    description:
      'Grove PMS is a modern hotel property management software built to simplify reservations, room availability, front desk, billing, housekeeping, and reporting.',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'sales@grovepms.com',
        url: `${BASE_URL}/contact`,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@grovepms.com',
        url: `${BASE_URL}/contact`,
      },
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Grove PMS',
    alternateName: ['Grove Hospitality OS', 'Grove Hotel Management System'],
    description:
      'Hotel property management software for independent hotels, boutique resorts, and multi-property groups.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  };
}

export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#software`,
    name: 'Grove PMS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All modern web browsers (Chrome, Safari, Firefox, Edge)',
    softwareVersion: '1.0.0',
    description:
      'Cloud-based hotel property management software designed for boutique hotels, independent properties, and multi-property hospitality groups. Unifies reservations, front desk room matrix, billing & folios, GST invoices, housekeeping, inventory, and owner reporting.',
    url: BASE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
    },
    featureList: [
      'Visual Front Desk Room Matrix & Calendar',
      'Real-time Hotel Reservation Management',
      'Unified Guest Folios & GST Invoicing',
      'Housekeeping Status & Turnaround Tracking',
      'Food & Beverage Kitchen Order Tickets (KOT)',
      'Multi-mode Payment Processing (Cash, Card, UPI)',
      'Hotel Inventory & Stock Consumption Auditing',
      'Manager Flash Reports & Occupancy Analytics',
      'Role-based Access Control with Database Row-Level Security',
    ],
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${BASE_URL}${crumb.item}`,
    })),
  };
}

export function getFaqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

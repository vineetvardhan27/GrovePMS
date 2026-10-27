import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.grovepms.me';
  const currentDate = new Date().toISOString();

  const publicRoutes: {
    path: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/hotel-management-software', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/features/reservations', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/features/room-management', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/features/guest-management', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/features/billing-and-payments', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/features/inventory-management', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/features/reports', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/faqs', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/security', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/compliance', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/cookie-policy', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

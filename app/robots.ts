import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.grovepms.me';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/pricing',
          '/contact',
          '/faqs',
          '/security',
          '/compliance',
          '/terms',
          '/privacy-policy',
          '/cookie-policy',
          '/hotel-management-software',
          '/features/',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/dashboard/',
          '/bookings',
          '/bookings/',
          '/rooms',
          '/rooms/',
          '/checkin',
          '/checkin/',
          '/checkout',
          '/checkout/',
          '/billing',
          '/billing/',
          '/guests',
          '/guests/',
          '/payments',
          '/payments/',
          '/food-beverage',
          '/food-beverage/',
          '/inventory',
          '/inventory/',
          '/banquet',
          '/banquet/',
          '/reports',
          '/reports/',
          '/settings',
          '/settings/',
          '/login',
          '/register-hotel',
          '/*?*redirectedFrom=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

import type { Metadata, Viewport } from 'next';
import '@fontsource/google-sans/400.css';
import '@fontsource/google-sans/500.css';
import '@fontsource/google-sans/600.css';
import '@fontsource/google-sans/700.css';
import './globals.css';
import { AuthProvider } from '../components/providers/AuthProvider';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/seo/structuredData';

export const viewport: Viewport = {
  themeColor: '#1F3D3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.grovepms.me'),
  title: {
    default: 'Grove PMS | Hotel Property Management Software',
    template: '%s | Grove PMS',
  },
  description:
    'Simplify hotel operations with Grove PMS. Manage reservations, room availability, guest records, billing, payments, inventory, and reports in one platform.',
  applicationName: 'Grove PMS',
  authors: [{ name: 'Grove Hospitality Technologies' }],
  creator: 'Grove PMS',
  publisher: 'Grove PMS',
  category: 'Business Software',
  keywords: [
    'Hotel property management software',
    'Hotel management software',
    'Hotel PMS software',
    'Hotel booking management software',
    'Hotel operations management software',
    'Cloud-based hotel PMS',
    'Hotel reservation management system',
    'Hotel front desk software',
    'Hotel billing software',
    'Hotel room management software',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.grovepms.me/',
    siteName: 'Grove PMS',
    title: 'Grove PMS | Hotel Property Management Software',
    description:
      'Simplify hotel operations with Grove PMS. Manage reservations, room availability, guest records, billing, payments, inventory, and reports in one platform.',
    images: [
      {
        url: '/Grove.png',
        width: 512,
        height: 512,
        alt: 'Grove PMS — Hotel Property Management Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grove PMS | Hotel Property Management Software',
    description:
      'Simplify hotel operations with Grove PMS. Manage reservations, room availability, guest records, billing, payments, inventory, and reports in one platform.',
    images: ['/Grove.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/Grove.png', type: 'image/png' },
    ],
    shortcut: [
      { url: '/Grove.png', type: 'image/png' },
    ],
    apple: [
      { url: '/Grove.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/mortezaom/google-sans-cdn@master/fonts.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('grove-theme') || 'system';
                  var r = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
                  if (r === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                  document.documentElement.setAttribute('data-theme', r);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-brand-sand text-ink antialiased font-sans">
        <JsonLd data={[orgSchema, websiteSchema]} />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


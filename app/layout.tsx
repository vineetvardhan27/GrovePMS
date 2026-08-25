import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/providers/AuthProvider';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grove — Hospitality OS',
  description: 'The unified operating system for modern hospitality. Manage rooms, reservations, guests, billing, and operations from one connected platform.',
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
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/Grove.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/Grove.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Grove.png" />
      </head>
      <body className="bg-brand-sand text-ink antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

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
  title: 'Hotel Greenery View — Control Centre',
  description: 'Hotel Management System for Hotel Greenery View, Gangtok, Sikkim',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: [
      { url: '/logo.png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
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
      <body className="bg-brand-sand text-ink antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

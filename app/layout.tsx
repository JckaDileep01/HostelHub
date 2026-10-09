import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegister } from '@/components/sw-register';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hostelhub.app';

// Runs synchronously before React hydrates — prevents flash of wrong theme
const themeScript = `(function(){try{var s=localStorage.getItem('theme');if(s==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'HostelHub — Smart Hostel Management Platform',
    template: '%s | HostelHub',
  },
  description:
    'HostelHub is an all-in-one hostel management system for owners and caretakers. Manage rooms, beds, tenants, rent collection, KYC, AI-powered payment reminders, maintenance, and multi-property dashboards — all in one place.',
  keywords: [
    'hostel management system',
    'hostel software',
    'PG management',
    'room booking software',
    'tenant management',
    'rent collection app',
    'hostel billing software',
    'hostel management app India',
    'bed allocation system',
    'property management software',
    'paying guest management',
    'hostel owner dashboard',
    'AI rent reminder',
    'hostel maintenance tracker',
  ],
  authors: [{ name: 'HostelHub', url: APP_URL }],
  creator: 'HostelHub',
  publisher: 'HostelHub',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_URL,
    siteName: 'HostelHub',
    title: 'HostelHub — Smart Hostel Management Platform',
    description:
      'Manage rooms, beds, tenants, rent, KYC, AI payment reminders & maintenance from a single dashboard. Built for hostel owners across India.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HostelHub — Smart Hostel Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HostelHub — Smart Hostel Management Platform',
    description:
      'All-in-one hostel management: rooms, beds, tenants, rent, KYC & AI reminders. Built for hostel owners.',
    images: ['/og-image.png'],
    creator: '@hostelhub_app',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HostelHub',
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  category: 'business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sync theme script: runs before paint to prevent dark/light flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="canonical" href={APP_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'HostelHub',
              url: APP_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'All-in-one hostel management system for owners and caretakers. Manage rooms, beds, tenants, rent, KYC, and maintenance.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
              },
              featureList: [
                'Room & Bed Management',
                'Tenant Onboarding & KYC',
                'Automated Rent Billing',
                'AI Voice Payment Reminders',
                'Multi-Hostel Switching',
                'Maintenance Tracking',
                'Payment Collection',
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <ServiceWorkerRegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

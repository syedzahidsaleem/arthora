import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arthora — AI Investment Research',
  description:
    'AI-powered mutual fund and stock research platform for Indian investors. Research 40,000+ mutual funds, build AI goal portfolios, and analyze NSE/BSE stocks.',
  keywords: [
    'Mutual Funds India',
    'AI Portfolio Builder',
    'NSE Stock Research',
    'AMFI Mutual Funds',
    'SIP Calculator',
    'Quant Financial Metrics',
    'CAGR',
    'Sharpe Ratio',
  ],
  authors: [{ name: 'Arthora Team' }],
  openGraph: {
    title: 'Arthora — AI Investment Research & Portfolio Builder',
    description:
      'AI-powered mutual fund and stock research platform tailored for Indian retail investors.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Arthora',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#0D0E1A] text-[#F8F9FA] antialiased font-sans selection:bg-[#6C63FF]/30 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="arthora-theme"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" theme="dark" richColors closeButton />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

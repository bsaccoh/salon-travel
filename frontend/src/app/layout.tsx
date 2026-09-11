import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import { Providers } from './providers';
import { RouteLoader } from '@/components/ui/route-loader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Salone Travel — Sierra Leone Travel Concierge Platform',
  description:
    'Discover verified local providers, book with confidence, and travel with real-time concierge support in Sierra Leone.',
  keywords: ['Sierra Leone', 'Travel', 'Concierge', 'Tours', 'Freetown', 'River No 2 Beach', 'Banana Islands'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-text selection:bg-primary-light selection:text-primary-dark">
        <NextTopLoader
          color="#1C8FA6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1C8FA6,0 0 5px #1C8FA6"
          zIndex={1600}
          showAtBottom={false}
        />
        <Providers>
          <RouteLoader>
            {children}
          </RouteLoader>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Dollar War / Flag War — Back Your Territory with $1',
  description:
    'The global territory clash where every dollar counts. Back your country, state, or city to conquer the live throne on Redis and Postgres.',
  openGraph: {
    title: 'Dollar War / Flag War — Global Territorial Clash',
    description: 'Back your country, state, or city with $1 and dominate the live leaderboard!',
    images: ['/api/og?slug=india'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080b12] text-foreground antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseCheck',
  description: 'Availability monitoring for websites and APIs.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'South Korea Travel Guide',
  description: 'Cities, neighborhoods, places and costs to plan your trip to South Korea.',
};

// English is the default locale. Locale routing (pt-BR under /pt) and hreflang arrive in Phase 4.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

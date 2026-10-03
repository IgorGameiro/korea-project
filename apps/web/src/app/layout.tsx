import type { ReactNode } from 'react';

// The real root layout is app/[locale]/layout.tsx (it owns <html lang>). This pass-through layout
// exists so Next can render not-found pages for requests that never reach a locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

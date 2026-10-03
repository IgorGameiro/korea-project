import Link from 'next/link';
import './globals.css';

// Fallback 404 for URLs outside any locale (the proxy normally routes everything to one).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <Link href="/" className="text-coral-500 font-semibold underline underline-offset-4">
            Back to the home page
          </Link>
        </main>
      </body>
    </html>
  );
}

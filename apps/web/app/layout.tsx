import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'MacShine - Privacy-first Mac Cleaner',
  description: 'Reclaim disk space without giving up your privacy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${mono.variable} antialiased bg-mc-bg text-mc-text min-h-screen flex flex-col font-sans selection:bg-mc-accent/30 selection:text-mc-accent`}>
        <header className="border-b border-mc-border/50 sticky top-0 z-50 bg-mc-bg/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-mono text-mc-accent font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
              &gt; MacShine
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/pricing" className="text-mc-muted hover:text-mc-text transition-colors">Pricing</Link>
              <Link href="/changelog" className="text-mc-muted hover:text-mc-text transition-colors">Changelog</Link>
              <div className="h-4 w-px bg-mc-border"></div>
              <Link href="/login" className="text-mc-muted hover:text-mc-text transition-colors">Log In</Link>
              <Link href="/signup" className="px-4 py-2 bg-mc-surface border border-mc-accent/30 text-mc-accent rounded hover:bg-mc-accent hover:text-mc-bg transition-colors font-medium">
                Get Pro
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>

        <footer className="border-t border-mc-border/50 py-12 mt-24">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-mc-muted">
            <div className="font-mono text-mc-accent">&gt; MacShine {new Date().getFullYear()}</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-mc-text">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-mc-text">Terms of Service</Link>
              <a href="https://github.com" target="_blank" className="hover:text-mc-text">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

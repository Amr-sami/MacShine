import Link from 'next/link';
import { ChevronLeft, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 w-full text-mc-muted leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-2 hover:text-mc-accent transition-colors mb-8 text-sm group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-12 text-mc-text">
        <div className="w-10 h-10 rounded-xl bg-mc-accent/10 border border-mc-accent/30 flex items-center justify-center text-mc-accent">
          <Shield size={20} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-mc-text mb-4">Our Commitment</h2>
          <p>
            MacShine is built on a "Privacy First, Offline Always" philosophy. 
            We do not collect, store, or transmit your file paths, filenames, or directory structures.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mc-text mb-4">Data Collection</h2>
          <p>
            MacShine processes all data locally on your device. We do not use any cloud-based 
            telemetry that identifies the contents of your disk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mc-text mb-4">License Verification</h2>
          <p>
            When you enter a Pro license key, the application makes a single request to our 
            API to verify the key. This request includes the key and a hashed device ID.
          </p>
        </section>
      </div>
    </div>
  );
}

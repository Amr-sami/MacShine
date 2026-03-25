import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 w-full text-mc-muted leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-2 hover:text-mc-accent transition-colors mb-8 text-sm group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-12 text-mc-text">
        <div className="w-10 h-10 rounded-xl bg-mc-accent/10 border border-mc-accent/30 flex items-center justify-center text-mc-accent">
          <FileText size={20} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      </div>

      <div className="space-y-8">
        <p>By using MacShine, you agree to these simple terms.</p>

        <section>
          <h2 className="text-xl font-bold text-mc-text mb-4">License</h2>
          <p>
            MacShine is licensed, not sold. Each license grants you the right to use 
            the software on a specified number of devices based on your plan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mc-text mb-4">No Liability</h2>
          <p>
            MacShine is provided "as is". While we take every precaution to ensure data safety 
            through two-step confirmation, we are not liable for accidental data loss.
          </p>
        </section>
      </div>
    </div>
  );
}

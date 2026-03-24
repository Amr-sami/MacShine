import { ExternalLink, Receipt } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Billing</h1>
      <p className="text-mc-muted mb-10">Manage your payment methods and download invoices.</p>

      <div className="bg-mc-surface border border-mc-border p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-full bg-mc-bg border border-mc-border flex items-center justify-center mb-6">
          <Receipt size={24} className="text-mc-muted" />
        </div>
        
        <h3 className="text-xl font-bold mb-3">Paddle Customer Portal</h3>
        <p className="text-mc-muted max-w-sm mb-8">
          We use Paddle to process payments securely. You can update your card or download past invoices from their secure portal.
        </p>

        <a 
          href="#" 
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Open Customer Portal <ExternalLink size={16} />
        </a>

        <p className="text-xs text-mc-muted mt-6 opacity-70">
          (This is a placeholder for the Paddle.js inline checkout/portal component)
        </p>
      </div>
    </div>
  );
}

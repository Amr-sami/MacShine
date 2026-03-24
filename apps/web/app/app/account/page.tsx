"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const [copied, setCopied] = useState(false);
  const mockLicenseKey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX21vY2siLCJwbGFuIjoicHJvIiwiZXhwIjoxNzk5OTk5OTk5fQ...";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLicenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Account & License</h1>
      <p className="text-mc-muted mb-10">Manage your macclean Pro subscription and license key.</p>

      {/* Subscription Status Card */}
      <div className="bg-mc-surface border border-mc-border rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mc-accent/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">macclean Pro</h2>
            <p className="text-sm text-mc-muted">Yearly billing</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-mc-accent/10 border border-mc-accent/30 text-mc-accent rounded-full text-sm font-medium">
            <CheckCircle2 size={16} />
            Active
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-6 border-y border-mc-border/50 mb-8">
          <div>
            <div className="text-sm text-mc-muted mb-1">Next billing date</div>
            <div className="font-medium">March 25, 2027</div>
          </div>
          <div>
            <div className="text-sm text-mc-muted mb-1">Amount</div>
            <div className="font-medium">$19.99 / year</div>
          </div>
        </div>

        {/* License Key Section */}
        <div>
          <h3 className="font-bold mb-2">Your License Key</h3>
          <p className="text-sm text-mc-muted mb-4">
            Paste this key into the macclean desktop app Settings to unlock Pro features.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1 bg-mc-bg border border-mc-border rounded-lg p-3 font-mono text-sm text-mc-accent truncate select-all">
              {mockLicenseKey}
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-mc-surface border border-mc-border hover:bg-mc-border hover:text-white transition-colors rounded-lg flex items-center gap-2 font-medium"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

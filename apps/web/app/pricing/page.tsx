"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center w-full px-6 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-mc-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, honest pricing.</h1>
        <p className="text-lg text-mc-muted max-w-xl mx-auto">
          No background agents, no hidden telemetry. Just a clean Mac.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Free Tier */}
        <div className="flex flex-col p-8 rounded-3xl bg-mc-surface border border-mc-border shadow-lg shadow-black/50">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-mc-muted mb-1 text-sm">forever</span>
          </div>
          <p className="text-sm text-mc-muted mb-8 h-10">
            Perfect for basic manual cleanup and unused app detection.
          </p>
          <a
            href="/download/MacShine-latest.dmg"
            className="w-full py-3 rounded-lg bg-mc-bg border border-mc-border text-center font-medium hover:bg-mc-border transition-colors mb-8"
          >
            Download Free
          </a>

          <div className="flex flex-col gap-4 text-sm">
            <Feature included text="10 Core Cleaning Modules" />
            <Feature included text="App Manager & Unused App Detection" />
            <Feature included text="Smart Notifications" />
            <Feature included text="Last 5 Cleaning Sessions History" />
            <Feature included text="Duplicates Limit (50 files)" />
            <Feature included text="Large Files Limit (20 results)" />
            <Feature included={false} text="Scheduled Background Cleaning" />
            <Feature included={false} text="Privacy Cleaner Module" />
            <Feature included={false} text="Cloud Dashboard Sync" />
            <Feature included={false} text="Email Cleaning Reports" />
          </div>
        </div>

        {/* Pro Tier */}
        <div className="flex flex-col p-8 rounded-3xl bg-mc-bg border-2 border-mc-accent shadow-2xl shadow-mc-accent/10 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-mc-accent text-mc-bg text-xs font-bold rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <h2 className="text-2xl font-bold mb-2 text-mc-accent">Pro</h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-bold">$19.99</span>
            <span className="text-mc-muted mb-1 text-sm">/ year</span>
          </div>
          <p className="text-sm text-mc-muted mb-8 h-10">
            Unlock automatic scheduling, deep privacy cleaning, and unlimited limits.
          </p>
          <Link
            href="/signup"
            className="w-full py-3 rounded-lg bg-mc-accent text-mc-bg text-center font-bold hover:bg-mc-accent/90 transition-transform active:scale-95 mb-8 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
          >
            Get MacShine Pro
          </Link>

          <div className="flex flex-col gap-4 text-sm">
            <Feature included text="Everything in Free" />
            <Feature included text="Unlimited History Logs" />
            <Feature included text="Unlimited Duplicates & Large Files" />
            <Feature included text="Scheduled Background Cleaning" />
            <Feature included text="Privacy Cleaner (Safari, Caches, DBs)" />
            <Feature included text="Cloud Dashboard Sync" />
            <Feature included text="Email Cleaning Reports" />
          </div>
        </div>

        {/* Family Plan */}
        <div className="flex flex-col p-8 rounded-3xl bg-mc-surface border border-mc-accent/30 relative overflow-hidden group hover:border-mc-accent transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mc-accent/5 blur-[50px] rounded-full group-hover:bg-mc-accent/10 transition-colors" />
          
          <h2 className="text-2xl font-bold mb-2">Family Plan</h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-bold">$34.99</span>
            <span className="text-mc-muted mb-1 text-sm">/ year</span>
          </div>
          <p className="text-sm text-mc-muted mb-8 h-10">
            For households with multiple Macs. Syncs to one shared dashboard.
          </p>

          <Link
            href="/signup?plan=family"
            className="w-full text-center py-3 bg-mc-surface border border-mc-accent/50 text-mc-accent font-medium rounded-xl hover:bg-mc-accent hover:text-mc-bg transition-colors mb-8 cursor-pointer relative z-10"
          >
            Start Family Trial
          </Link>

          <div className="flex flex-col gap-4 text-sm">
            <Feature included text="Up to 5 Devices" />
            <Feature included text="Shared Cloud Dashboard" />
            <Feature included text="Unlimited Cleaning History" />
            <Feature included text="Unlimited Duplicates & Large Files" />
            <Feature included text="Scheduled Cleaning" />
            <Feature included text="Privacy Cleaner Module" />
            <Feature included text="Email Cleaning Reports" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-start gap-3">
      {included ? (
        <Check size={18} className="text-mc-accent shrink-0 mt-0.5" />
      ) : (
        <X size={18} className="text-mc-muted/50 shrink-0 mt-0.5" />
      )}
      <span className={included ? "text-mc-text" : "text-mc-muted line-through opacity-70"}>
        {text}
      </span>
    </div>
  );
}

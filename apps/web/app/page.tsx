"use client";

import { motion } from "framer-motion";
import { Terminal, Shield, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-mc-accent/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mc-surface border border-mc-accent/30 text-mc-accent text-sm mb-8 font-mono"
        >
          <Terminal size={14} />
          <span>v1.0 is now available</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-6"
        >
          Clean your Mac without<br />giving up your privacy.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-mc-muted max-w-2xl mb-10"
        >
          A fast, offline-first system optimizer that never auto-deletes your files,
          never uploading your paths to the cloud. Your exact disk, exactly how you left it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <a
            href="/download/MacShine-latest.dmg"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-mc-accent text-mc-bg rounded-lg font-bold hover:bg-mc-accent/90 transition-all hover:scale-105 active:scale-95"
          >
            Download for macOS
            <span className="text-xs opacity-80 font-mono font-normal">.dmg</span>
          </a>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-mc-surface text-mc-text border border-mc-border rounded-lg font-medium hover:bg-mc-border transition-all group"
          >
            View Pro Features
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield className="text-mc-accent" />}
            title="Privacy First, Offline Always"
            description="Your file paths, names, and directories never leave your Mac. MacShine is built to run 100% offline, keeping your sensitive data exactly where it belongs."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="text-mc-accent" />}
            title="Two-Step Confirmation"
            description="Unlike other cleaners, we never auto-delete. Every deletion requires an explicit confirmation, presenting exactly what you'll lose and how much space you'll gain."
          />
          <FeatureCard 
            icon={<Zap className="text-mc-accent" />}
            title="Smart Notifications"
            description="Get proactive nudges when you have apps unused for 90+ days or when disk space crosses 85%, respecting macOS Do Not Disturb and presentation modes."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-mc-surface border border-mc-border/50 hover:border-mc-accent/30 transition-colors group"
    >
      <div className="w-12 h-12 rounded-xl bg-mc-bg border border-mc-border flex items-center justify-center mb-6 group-hover:bg-mc-accent/10 group-hover:border-mc-accent/50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-mc-muted leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}

import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    // Step 0: Welcome
    <div className="flex flex-col items-center text-center" key="welcome">
      <h1 className="text-3xl font-bold text-mc-accent mb-3 font-mono">macclean</h1>
      <p className="text-mc-text text-lg mb-2">Welcome to macclean</p>
      <p className="text-mc-muted text-sm max-w-sm mb-8">
        Reclaim disk space, clean system junk, and keep your Mac running fast — without ever deleting anything you didn't approve.
      </p>
      <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-mc-accent text-mc-bg font-semibold rounded-xl text-sm">
        Get Started
      </button>
    </div>,

    // Step 1: Full Disk Access
    <div className="flex flex-col items-center text-center" key="fda">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-mc-text mb-2">Full Disk Access</h2>
      <p className="text-mc-muted text-sm max-w-sm mb-6">
        macclean needs Full Disk Access to scan all caches and logs. Without it, some modules may show errors.
      </p>
      <button
        onClick={() => window.macclean && (window as any).macclean.openPrivacySettings?.()}
        className="px-5 py-2.5 bg-mc-accent text-mc-bg font-semibold rounded-xl text-sm mb-3"
      >
        Open Privacy Settings
      </button>
      <button onClick={() => setStep(2)} className="text-sm text-mc-muted hover:text-mc-text">
        Skip for now
      </button>
    </div>,

    // Step 2: Notifications
    <div className="flex flex-col items-center text-center" key="notifs">
      <div className="text-4xl mb-4">🔔</div>
      <h2 className="text-xl font-bold text-mc-text mb-2">Notifications</h2>
      <p className="text-mc-muted text-sm max-w-sm mb-6">
        macclean can notify you when apps are unused or when your disk is getting full. You can change this anytime in Settings.
      </p>
      <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-mc-accent text-mc-bg font-semibold rounded-xl text-sm mb-3">
        Enable Notifications
      </button>
      <button onClick={() => setStep(3)} className="text-sm text-mc-muted hover:text-mc-text">
        Skip
      </button>
    </div>,

    // Step 3: Ready
    <div className="flex flex-col items-center text-center" key="ready">
      <div className="text-4xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-mc-text mb-2">You're Ready!</h2>
      <p className="text-mc-muted text-sm max-w-sm mb-6">
        macclean is ready to scan your system. A Smart Scan usually finds 2–5 GB of reclaimable space.
      </p>
      <button
        onClick={() => {
          // Mark onboarding complete via IPC
          (window as any).macclean?.setOnboardingComplete?.();
          onComplete();
        }}
        className="px-6 py-2.5 bg-mc-accent text-mc-bg font-semibold rounded-xl text-sm"
      >
        Run Smart Scan
      </button>
    </div>,
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-mc-bg px-8">
      {steps[step]}

      {/* Step indicators */}
      <div className="flex gap-2 mt-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-mc-accent' : 'bg-mc-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    setDirection(1);
    if (step < 4) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    // Invoke IPC to mark complete
    if ((window as any).macclean) {
      (window as any).macclean.setOnboardingComplete?.();
    }
    onComplete();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[--bg-base]/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[--bg-elevated] rounded-2xl p-10 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col items-center text-center justify-center"
          >
            {step === 1 && (
              <>
                <div className="mb-8">
                  <img src="/logo.svg" alt="MacShine" width={140} height={38} className="mx-auto" />
                </div>
                <h1 className="text-3xl font-semibold mb-3">Your Mac. Cleaner.</h1>
                <p className="text-[14px] leading-loose text-[--text-secondary] mb-8">
                  MacShine finds and removes junk safely — you always approve before anything is deleted.
                </p>
                <Button onClick={nextStep} className="w-full">Get Started</Button>
              </>
            )}

            {step === 2 && (
              <>
                <HardDrive size={32} className="text-[--accent] mb-6" />
                <h1 className="text-xl font-semibold mb-3">One permission needed</h1>
                <p className="text-[14px] leading-loose text-[--text-secondary] mb-8">
                  MacShine needs Full Disk Access to scan system caches and logs. Without it, some modules won't work.
                </p>
                <Button 
                  onClick={() => {
                    if ((window as any).macclean) (window as any).macclean.openPrivacySettings?.();
                    nextStep();
                  }} 
                  className="w-full mb-3"
                >
                  Open Privacy Settings
                </Button>
                <Button variant="ghost" onClick={nextStep}>Skip for now</Button>
              </>
            )}

            {step === 3 && (
              <>
                <Bell size={32} className="text-[--accent] mb-6" />
                <h1 className="text-xl font-semibold mb-3">Stay informed</h1>
                <p className="text-[14px] leading-loose text-[--text-secondary] mb-8">
                  Get notified when unused apps are taking space or your disk is almost full.
                </p>
                <Button onClick={nextStep} className="w-full mb-3">Enable Notifications</Button>
                <Button variant="ghost" onClick={nextStep}>Skip</Button>
              </>
            )}

            {step === 4 && (
              <>
                <div className="relative mb-8 w-[140px] h-[140px] flex items-center justify-center">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="absolute -rotate-90">
                    <circle cx="70" cy="70" r="64" fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
                    <circle cx="70" cy="70" r="64" fill="none" stroke="var(--accent)" strokeWidth="10" strokeDasharray="402" strokeDashoffset="250" />
                  </svg>
                  <span className="text-[20px] font-mono font-semibold">Ready</span>
                </div>
                <h1 className="text-xl font-semibold mb-3">You're all set.</h1>
                <p className="text-[14px] leading-loose text-[--text-secondary] mb-8">
                  Here's where things stand.
                </p>
                <Button onClick={finish} className="w-full">Run Smart Scan</Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-auto pt-8">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${step === i ? 'bg-[--accent]' : 'bg-[--border-default]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

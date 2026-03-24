"use client";

import { useState } from "react";
import { Terminal, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock Supabase login
    setTimeout(() => {
      setIsLoading(false);
      router.push("/app/dashboard");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-mc-accent/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="w-full max-w-md bg-mc-surface border border-mc-border p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-mc-bg border border-mc-border text-mc-accent rounded-xl flex items-center justify-center">
            <Terminal size={24} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p className="text-mc-muted text-center text-sm mb-8">
          Log in to your macclean Pro account.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-mc-muted uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-mc-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-mc-muted uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-mc-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-mc-accent text-mc-bg rounded-lg font-bold hover:bg-mc-accent/90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Log In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-mc-muted">
          Don't have an account?{" "}
          <Link href="/signup" className="text-mc-text hover:text-mc-accent transition-colors">
            Sign up for Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

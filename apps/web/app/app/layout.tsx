"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, LayoutDashboard, UserCircle, CreditCard, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/history", label: "Cleaning History", icon: History },
    { href: "/app/account", label: "Account & License", icon: UserCircle },
    { href: "/app/billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full max-w-7xl mx-auto">
      {/* Sidebar */}
      <aside className="w-64 border-r border-mc-border/50 bg-mc-bg p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2 mb-10 text-mc-accent px-2">
          <Terminal size={20} />
          <span className="font-mono font-bold tracking-tight">Pro Dashboard</span>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-mc-surface text-mc-text border border-mc-border/50 shadow-sm" 
                    : "text-mc-muted hover:text-mc-text hover:bg-mc-surface/50"
                )}
              >
                <Icon size={18} className={isActive ? "text-mc-accent" : "opacity-70"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-mc-border p-4 -mx-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-sm text-mc-muted hover:text-mc-destructive transition-colors"
          >
            <LogOut size={18} />
            Log Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-mc-bg/50">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Bot, Braces, ClipboardCheck, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: Home },
  { href: "/learn", label: "学習ロードマップ", icon: BookOpen },
  { href: "/practice", label: "問題演習", icon: Braces },
  { href: "/mock-exam", label: "模擬試験", icon: ClipboardCheck },
  { href: "/ai-tutor", label: "AIチューター", icon: Bot },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] border-r border-border bg-[#0b0e14] px-3 py-5 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-mono text-sm font-bold shadow-glow">C</span>
          <span>
            <strong className="block text-sm tracking-wide">C PASS LAB</strong>
            <span className="text-[10px] uppercase tracking-[.2em] text-muted">Grade 3 Academy</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-panel hover:text-white", active && "bg-primary/15 text-[#b8afff]")}>
                <item.icon className="h-[17px] w-[17px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-3 right-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b8afff]"><BarChart3 className="h-4 w-4" /> 合格までの道のり</div>
          <p className="text-[11px] leading-relaxed text-muted">毎日15分でも継続すると、知識が定着しやすくなります。</p>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-border bg-[#0b0e14]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex min-h-[58px] flex-col items-center justify-center gap-1 text-[9px] text-muted", active && "text-[#a99fff]")}>
              <item.icon className="h-[18px] w-[18px]" />
              <span className="max-w-full truncate">{item.label.replace("ダッシュボード", "ホーム").replace("学習ロードマップ", "学習").replace("AIチューター", "AI")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

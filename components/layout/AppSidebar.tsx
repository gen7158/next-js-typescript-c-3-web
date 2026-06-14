"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BookOpen, Bot, Braces, Check, ChevronLeft, ChevronRight, ClipboardCheck, Home, Rocket, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessons } from "@/data/lessons";
import { useLearningStore } from "@/store/learningStore";
import { useUIStore } from "@/store/uiStore";
import { calculateCategoryAccuracy } from "@/lib/scoring";

const navItems = [
  { href: "/", label: "ダッシュボード", short: "ホーム", icon: Home },
  { href: "/learn", label: "学習ロードマップ", short: "学習", icon: BookOpen },
  { href: "/advanced", label: "合格後の発展編", short: "発展", icon: Rocket },
  { href: "/practice", label: "問題演習", short: "演習", icon: Braces },
  { href: "/mock-exam", label: "模擬試験", short: "模試", icon: ClipboardCheck },
  { href: "/ai-tutor", label: "AIチューター", short: "AI", icon: Bot },
  { href: "/settings", label: "設定", short: "設定", icon: Settings },
];

function SidebarBody({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const completed = useLearningStore((state) => state.completedLessons);
  const attempts = useLearningStore((state) => state.attempts);
  const accuracy = calculateCategoryAccuracy(attempts);
  const compact = !mobile && collapsed;
  const lessonMode = pathname.startsWith("/learn/");

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-border px-4", compact ? "justify-center" : "justify-between")}>
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary font-mono text-sm font-bold shadow-glow">C</span>
          {!compact && <span className="min-w-0"><strong className="block truncate text-sm tracking-wide">C PASS LAB</strong><span className="text-[9px] uppercase tracking-[.18em] text-muted">Grade 3 Academy</span></span>}
        </Link>
        {mobile && <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-muted hover:bg-panel"><X className="h-5 w-5" /></button>}
      </div>

      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={compact ? item.label : undefined} onClick={() => setMobileOpen(false)} className={cn("flex h-11 items-center rounded-lg text-sm font-medium text-muted transition hover:bg-panel hover:text-white", compact ? "justify-center px-0" : "gap-3 px-3", active && "bg-primary/15 text-[#b8afff]")}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!compact && item.label}
            </Link>
          );
        })}
      </nav>

      {lessonMode && (
        <div className="min-h-0 flex-1 border-t border-border">
          {!compact && <div className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[.17em] text-muted">レッスンステップ</div>}
          <div className="h-full overflow-y-auto px-2 pb-6">
            {lessons.map((lesson, index) => {
              const active = pathname === `/learn/${lesson.id}`;
              const done = completed.includes(lesson.id);
              const weak = accuracy[lesson.category] !== undefined && accuracy[lesson.category] < 60;
              return (
                <Link key={lesson.id} href={`/learn/${lesson.id}`} title={compact ? `${index + 1}. ${lesson.title}` : undefined} className={cn("mb-1 flex min-h-10 items-center rounded-lg text-xs transition hover:bg-panel", compact ? "justify-center px-1" : "gap-2 px-3", active && "bg-primary/15 text-white")}>
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border border-border font-mono text-[10px] text-muted", done && "border-success/30 bg-success/10 text-success", active && "border-primary/40 text-[#b5adff]")}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                  {!compact && <span className="min-w-0 flex-1 truncate">{lesson.title}</span>}
                  {!compact && weak && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!mobile && <button onClick={toggleSidebar} className={cn("mx-3 mb-4 flex h-10 items-center rounded-lg border border-border text-xs font-semibold text-muted hover:bg-panel hover:text-white", compact ? "justify-center" : "justify-center gap-2")}>{compact ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" />折りたたむ</>}</button>}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const mobileOpen = useUIStore((state) => state.mobileSidebarOpen);
  const setMobileOpen = useUIStore((state) => state.setMobileSidebarOpen);
  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-[#0b0e14] transition-[width] duration-300 lg:block", collapsed ? "w-[72px]" : "w-[280px]")}><SidebarBody /></aside>
      {mobileOpen && <button className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="メニューを閉じる" />}
      <aside className={cn("fixed inset-y-0 left-0 z-[60] w-[280px] -translate-x-full border-r border-border bg-[#0b0e14] transition-transform lg:hidden", mobileOpen && "translate-x-0")}><SidebarBody mobile /></aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-border bg-[#0b0e14]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={cn("flex min-h-[58px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 text-[9px] text-muted", active && "text-[#a99fff]")}><item.icon className="h-[18px] w-[18px]" /><span>{item.short}</span></Link>;
        })}
      </nav>
    </>
  );
}

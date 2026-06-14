"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, KeyRound, Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/store/learningStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";

const names: Record<string, string> = {
  "/": "学習ダッシュボード",
  "/learn": "学習ロードマップ",
  "/advanced": "合格後の発展カリキュラム",
  "/practice": "問題演習",
  "/mock-exam": "模擬試験",
  "/ai-tutor": "Gemini AIチューター",
  "/settings": "設定",
};

export function Header() {
  const pathname = usePathname();
  const apiKey = useLearningStore((state) => state.apiKey);
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const setAiDrawerOpen = useUIStore((state) => state.setAiDrawerOpen);
  const base = `/${pathname.split("/")[1]}`;
  const title = names[pathname] ?? names[base] ?? "C PASS LAB";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)} aria-label="メニューを開く"><Menu className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar} aria-label="サイドバーを折りたたむ">{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</Button>
        <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted">C programming certification</div>
        <h1 className="mt-0.5 truncate text-sm font-semibold sm:text-base">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="hidden border-cyan/20 bg-cyan/10 text-cyan sm:inline-flex"><Sparkles className="mr-1 h-3 w-3" /> 3級対策</Badge>
        <Button variant="secondary" size="sm" onClick={() => setAiDrawerOpen(true)}><Bot className="h-4 w-4 text-[#aaa1ff]" /><span className="hidden sm:inline">AIチューター</span></Button>
        <Link href="/settings">
          <Badge className={apiKey ? "border-success/20 bg-success/10 text-success" : "border-warning/20 bg-warning/10 text-warning"}>
            <KeyRound className="mr-1 h-3 w-3" /> {apiKey ? "AI設定済み" : "APIキー未設定"}
          </Badge>
        </Link>
      </div>
    </header>
  );
}

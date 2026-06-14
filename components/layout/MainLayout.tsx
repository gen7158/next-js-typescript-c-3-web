"use client";

import { useEffect, type ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { GeminiTutorPanel } from "@/components/gemini/GeminiTutorPanel";
import { useLearningStore } from "@/store/learningStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: ReactNode }) {
  const hydrate = useLearningStore((state) => state.hydrate);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const aiDrawerOpen = useUIStore((state) => state.aiDrawerOpen);
  const setAiDrawerOpen = useUIStore((state) => state.setAiDrawerOpen);
  const focusMode = useUIStore((state) => state.focusMode);
  useEffect(() => hydrate(), [hydrate]);
  return (
    <div className={cn("min-h-screen", focusMode && "bg-[#07090d]")}>
      {!focusMode && <AppSidebar />}
      <div className={cn("transition-[padding] duration-300", !focusMode && (sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]"))}>
        {!focusMode && <Header />}
        <main className={cn("mx-auto w-full max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8", focusMode && "max-w-none p-0 pb-0")}>{children}</main>
      </div>
      {aiDrawerOpen && !focusMode && <button aria-label="AIパネルを閉じる" className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" onClick={() => setAiDrawerOpen(false)} />}
      <aside className={cn("fixed inset-y-0 right-0 z-[60] w-[min(520px,100vw)] translate-x-full border-l border-border bg-[#0c0f15] shadow-2xl transition-transform duration-300", aiDrawerOpen && !focusMode && "translate-x-0")}>
        <GeminiTutorPanel compact onClose={() => setAiDrawerOpen(false)} />
      </aside>
    </div>
  );
}

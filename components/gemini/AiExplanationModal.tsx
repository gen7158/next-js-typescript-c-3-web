"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Bot, X } from "lucide-react";
import { GeminiTutorPanel } from "@/components/gemini/GeminiTutorPanel";

export function AiExplanationModal({ open, onOpenChange, title = "Gemini AIレビュー", initialPrompt }: { open: boolean; onOpenChange: (open: boolean) => void; title?: string; initialPrompt?: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] h-[min(820px,calc(100vh-2rem))] w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <Dialog.Title className="flex h-14 items-center gap-2 border-b border-border px-5 text-sm font-semibold"><Bot className="h-4 w-4 text-[#aaa1ff]" />{title}</Dialog.Title>
          <Dialog.Close className="absolute right-4 top-3.5 rounded-lg p-2 text-muted hover:bg-panel hover:text-white"><X className="h-4 w-4" /></Dialog.Close>
          <div className="h-[calc(100%-3.5rem)]"><GeminiTutorPanel compact initialPrompt={initialPrompt} onClose={() => onOpenChange(false)} /></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

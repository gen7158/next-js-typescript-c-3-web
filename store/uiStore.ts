"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeminiMode } from "@/types/gemini";

export type AiContext = {
  title?: string;
  lesson?: string;
  problem?: string;
  code?: string;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type UIStore = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  aiDrawerOpen: boolean;
  focusMode: boolean;
  aiMode: GeminiMode;
  aiContext: AiContext;
  chatMessages: ChatMessage[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setMobileSidebarOpen: (value: boolean) => void;
  setAiDrawerOpen: (value: boolean) => void;
  setFocusMode: (value: boolean) => void;
  setAiMode: (mode: GeminiMode) => void;
  setAiContext: (context: AiContext) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
};

export const useUIStore = create<UIStore>()(persist((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  aiDrawerOpen: false,
  focusMode: false,
  aiMode: "simple",
  aiContext: {},
  chatMessages: [],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setAiMode: (aiMode) => set({ aiMode }),
  setAiContext: (aiContext) => set({ aiContext }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),
}), {
  name: "c-pass-lab-ui-v2",
  partialize: (state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    aiMode: state.aiMode,
    chatMessages: state.chatMessages.slice(-30),
  }),
}));

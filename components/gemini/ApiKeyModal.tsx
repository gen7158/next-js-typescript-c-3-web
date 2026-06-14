"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteApiKey, listGeminiModels, saveApiKey, saveSelectedModel, selectRecommendedModel } from "@/lib/gemini";
import { useLearningStore } from "@/store/learningStore";

export function ApiKeyModal({ trigger }: { trigger?: React.ReactNode }) {
  const apiKey = useLearningStore((state) => state.apiKey);
  const setApiKey = useLearningStore((state) => state.setApiKey);
  const setModels = useLearningStore((state) => state.setModels);
  const setSelectedModel = useLearningStore((state) => state.setSelectedModel);
  const [draft, setDraft] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const clean = draft.trim();
    if (!clean) return;
    setSaving(true);
    setError("");
    saveApiKey(clean);
    setApiKey(clean);
    try {
      const models = await listGeminiModels(clean);
      setModels(models);
      const recommended = selectRecommendedModel(models);
      setSelectedModel(recommended);
      saveSelectedModel(recommended);
      setOpen(false);
    } catch (value) {
      setError(value instanceof Error ? value.message : "モデル一覧を取得できませんでした。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => { setOpen(value); if (value) setDraft(apiKey); }}>
      <Dialog.Trigger asChild>{trigger ?? <Button><KeyRound className="h-4 w-4" /> APIキーを設定</Button>}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div><Dialog.Title className="text-lg font-semibold">Gemini APIキー</Dialog.Title><Dialog.Description className="mt-1 text-xs text-muted">キーはこのブラウザのlocalStorageに保存されます。</Dialog.Description></div>
            <Dialog.Close className="rounded-lg p-2 text-muted hover:bg-panel hover:text-white"><X className="h-4 w-4" /></Dialog.Close>
          </div>
          <div className="relative mt-6">
            <input type={visible ? "text" : "password"} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="AIza..." className="h-12 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none focus:border-primary" />
            <button onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <p className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-3 text-[11px] leading-relaxed text-warning">APIキーをブラウザに保存する方式は、個人学習用・ローカル利用向けです。公開サイトとして運用する場合は、Next.js API Routeなどを使い、サーバー側でAPIキーを管理してください。</p>
          {error && <p className="mt-3 rounded-lg bg-danger/10 p-3 text-[11px] leading-6 text-danger">{error} キーは保存済みです。設定画面でモデル名を手動指定することもできます。</p>}
          <div className="mt-6 flex justify-between gap-3">
            <Button variant="danger" onClick={() => { deleteApiKey(); setApiKey(""); setDraft(""); }}>削除</Button>
            <Button onClick={() => void save()} disabled={!draft.trim() || saving}>{saving ? "モデルを確認中..." : "保存して自動選択"}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

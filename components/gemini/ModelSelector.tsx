"use client";

import { useState } from "react";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { listGeminiModels, saveSelectedModel, selectRecommendedModel } from "@/lib/gemini";
import { useLearningStore } from "@/store/learningStore";

export function ModelSelector() {
  const { apiKey, selectedModel, modelsCache, modelsUpdatedAt, setSelectedModel, setModels } = useLearningStore();
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const models = await listGeminiModels(apiKey);
      setModels(models);
      const recommended = selectRecommendedModel(models);
      if (!models.some((model) => model.name === selectedModel)) {
        setSelectedModel(recommended);
        saveSelectedModel(recommended);
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "モデル一覧を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  const choose = (name: string) => {
    const clean = name.replace(/^models\//, "").trim();
    if (!clean) return;
    setSelectedModel(clean);
    saveSelectedModel(clean);
  };

  const recommended = selectRecommendedModel(modelsCache);
  const displayModels = modelsCache.length ? modelsCache : [
    { name: "gemini-2.5-flash", supportedGenerationMethods: ["generateContent"] },
    { name: "gemini-2.0-flash", supportedGenerationMethods: ["generateContent"] },
    { name: "gemini-1.5-flash", supportedGenerationMethods: ["generateContent"] },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-semibold">利用モデル</h3><p className="mt-1 text-xs text-muted">最終更新: {formatDateTime(modelsUpdatedAt)}</p></div>
        <Button variant="secondary" size="sm" onClick={() => void refresh()} disabled={!apiKey || loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} 一覧を更新
        </Button>
      </div>
      {error && <p className="mb-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">{error} APIキーが間違っている可能性もあります。</p>}
      <div className="space-y-2">
        {displayModels.map((model) => (
          <button key={model.name} onClick={() => choose(model.name)} className="flex w-full items-center gap-3 rounded-lg border border-border bg-background/50 p-3 text-left transition hover:border-primary/40">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-[#aaa1ff]"><Sparkles className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{model.name}</span><span className="text-[10px] text-muted">{model.supportedGenerationMethods.join(", ")}</span></span>
            {model.name === recommended && <Badge className="hidden border-primary/30 bg-primary/10 text-[#b3aaff] sm:inline-flex">推奨</Badge>}
            {model.name === selectedModel && <Badge className="border-success/30 bg-success/10 text-success"><Check className="mr-1 h-3 w-3" />選択中</Badge>}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="手動モデル名（例: gemini-2.5-flash）" className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" />
        <Button variant="secondary" onClick={() => { choose(manual); setManual(""); }} disabled={!manual.trim()}>適用</Button>
      </div>
    </div>
  );
}

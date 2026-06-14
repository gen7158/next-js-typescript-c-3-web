"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { analyzeWeakness } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { useLearningStore } from "@/store/learningStore";

export function WeaknessAnalysis({ categories }: { categories: { category: string; accuracy: number }[] }) {
  const { apiKey, selectedModel } = useLearningStore();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setError("");
    try { setText((await analyzeWeakness({ apiKey, model: selectedModel, categories })).text); }
    catch (value) { setError(value instanceof Error ? value.message : "分析できませんでした。"); }
    finally { setLoading(false); }
  };
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-[#ada4ff]"><Bot className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Gemini 弱点分析</h3><p className="text-[10px] text-muted">結果に合わせた次の学習プラン</p></div></div>
      {text && <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-[#d7d3f2]">{text}</p>}
      {error && <p className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">{error}</p>}
      {!text && <Button className="mt-4" variant="secondary" size="sm" onClick={() => void run()} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}AIに分析してもらう</Button>}
    </div>
  );
}

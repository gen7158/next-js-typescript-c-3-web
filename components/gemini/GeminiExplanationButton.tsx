"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateGeminiExplanation } from "@/lib/gemini";
import { useLearningStore } from "@/store/learningStore";

export function GeminiExplanationButton({ prompt, context }: { prompt: string; context?: string }) {
  const { apiKey, selectedModel } = useLearningStore();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateGeminiExplanation({ apiKey, model: selectedModel, mode: "detailed", prompt, context });
      setText(result.text);
    } catch (value) {
      setError(value instanceof Error ? value.message : "追加解説を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="secondary" size="sm" onClick={() => void run()} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#b2a9ff]" />}
        Geminiで追加解説
      </Button>
      {(text || error) && <div className={error ? "mt-3 rounded-lg bg-danger/10 p-4 text-xs leading-6 text-danger" : "mt-3 whitespace-pre-wrap rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs leading-6 text-[#ddd9ff]"}>{error || text}</div>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#080a0f]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted"><span className="h-2 w-2 rounded-full bg-cyan" /> C source</span>
        <Button variant="ghost" size="sm" onClick={() => void copy()}>{copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "コピー済み" : "コピー"}</Button>
      </div>
      <pre className="code-block overflow-x-auto p-5 text-[13px] leading-6 text-[#d4d8e2]"><code>{code}</code></pre>
    </div>
  );
}

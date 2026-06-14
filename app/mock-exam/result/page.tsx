"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamResult } from "@/components/exam/ExamResult";
import type { ExamHistory } from "@/types/progress";
import { useLearningStore } from "@/store/learningStore";

export default function ExamResultPage() {
  const history = useLearningStore((state) => state.examHistory);
  const [result, setResult] = useState<ExamHistory | null>(null);
  useEffect(() => {
    try {
      const current = sessionStorage.getItem("c-pass-lab-latest-result");
      setResult(current ? JSON.parse(current) as ExamHistory : history.at(-1) ?? null);
    } catch { setResult(history.at(-1) ?? null); }
  }, [history]);
  if (!result) return <div className="rounded-xl border border-border bg-surface p-8 text-center"><h1 className="font-semibold">表示できる試験結果がありません</h1><Link href="/mock-exam" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold">模擬試験へ</Link></div>;
  return <ExamResult result={result} />;
}

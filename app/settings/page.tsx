"use client";

import { Database, KeyRound, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { ApiKeyModal } from "@/components/gemini/ApiKeyModal";
import { ModelSelector } from "@/components/gemini/ModelSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteApiKey } from "@/lib/gemini";
import { useLearningStore } from "@/store/learningStore";

export default function SettingsPage() {
  const state = useLearningStore();
  const reset = () => {
    if (!window.confirm("学習履歴、設定、模試履歴をすべて初期化しますか？")) return;
    deleteApiKey();
    state.reset();
  };
  return (
    <div className="animate-in mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl border border-border bg-gradient-to-r from-primary/15 via-surface to-surface p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#aaa1ff]">Preferences & data</p><h1 className="mt-2 text-3xl font-bold">設定</h1><p className="mt-3 text-sm text-muted">Gemini APIと、このブラウザに保存された学習データを管理します。</p>
      </section>
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-[#aaa1ff]"><KeyRound className="h-5 w-5" /></span>
          <div className="flex-1"><div className="flex items-center gap-2"><h2 className="font-semibold">Gemini APIキー</h2><Badge className={state.apiKey ? "border-success/20 bg-success/10 text-success" : "border-warning/20 bg-warning/10 text-warning"}>{state.apiKey ? "設定済み" : "未設定"}</Badge></div><p className="mt-2 text-xs leading-6 text-muted">キーはサーバーへ保存せず、現在のブラウザ内にだけ保持します。</p></div>
          <ApiKeyModal trigger={<Button variant="secondary">{state.apiKey ? "変更する" : "APIキーを設定"}</Button>} />
        </div>
        <div className="mt-5 rounded-lg border border-warning/20 bg-warning/5 p-4 text-[11px] leading-6 text-warning"><ShieldAlert className="mb-2 h-4 w-4" />APIキーをブラウザに保存する方式は、個人学習用・ローカル利用向けです。公開サイトとして運用する場合は、Next.js API Routeなどを使い、サーバー側でAPIキーを管理してください。</div>
      </Card>
      <Card className="p-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/10 text-cyan"><Sparkles className="h-5 w-5" /></span><div><h2 className="font-semibold">Geminiモデル</h2><p className="text-xs text-muted">generateContent対応モデルを自動取得します。</p></div></div><ModelSelector /></Card>
      <Card className="p-6">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-success/10 text-success"><Database className="h-5 w-5" /></span><div><h2 className="font-semibold">保存データ</h2><p className="mt-1 text-xs text-muted">localStorageが壊れた場合も、次回読込時に安全な初期状態へ戻します。</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{[
          ["完了レッスン", state.completedLessons.length],
          ["発展講座", state.completedAdvancedLessons.length],
          ["回答履歴", state.attempts.length],
          ["復習問題", state.reviewQuestionIds.length],
          ["模試履歴", state.examHistory.length],
        ].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-background p-3"><strong className="block text-lg">{value}</strong><span className="text-[10px] text-muted">{label}</span></div>)}</div>
        <div className="mt-6 border-t border-border pt-5"><Button variant="danger" onClick={reset}><RotateCcw className="h-4 w-4" />すべて初期化</Button><p className="mt-2 text-[10px] text-muted">この操作は取り消せません。</p></div>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function WeaknessCard({ weaknesses }: { weaknesses: { category: string; accuracy: number }[] }) {
  return (
    <Card className="h-full p-5">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-danger">Needs focus</p><h2 className="mt-1 font-semibold">苦手分野</h2></div><Target className="h-5 w-5 text-danger" /></div>
      {weaknesses.length ? <div className="space-y-4">{weaknesses.map((item) => <div key={item.category}><div className="mb-2 flex justify-between text-xs"><span>{item.category}</span><span className="font-semibold text-danger">{item.accuracy}%</span></div><Progress value={item.accuracy} indicatorClassName="bg-danger" /></div>)}</div> : <p className="rounded-lg bg-panel p-4 text-xs leading-6 text-muted">まだ分析できる回答履歴がありません。問題を5問ほど解くと、苦手分野が表示されます。</p>}
      <Link href="/practice?mode=review" className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#aaa1ff]">弱点を演習する <ArrowRight className="h-3.5 w-3.5" /></Link>
    </Card>
  );
}

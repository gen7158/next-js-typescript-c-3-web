"use client";

import { Filter, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { questionCategories } from "@/data/questions";
import type { QuestionDifficulty, QuestionType } from "@/types/question";

type Props = {
  category: string;
  difficulty: string;
  type: string;
  onCategory: (value: string) => void;
  onDifficulty: (value: string) => void;
  onType: (value: string) => void;
  onRandom: () => void;
};

const selectClass = "h-10 min-w-0 rounded-lg border border-border bg-panel px-3 text-xs text-[#d9dde6] outline-none focus:border-primary";

export function QuestionFilter(props: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 lg:flex-row lg:items-center">
      <span className="flex items-center gap-2 text-xs font-semibold"><Filter className="h-4 w-4 text-[#aaa1ff]" />絞り込み</span>
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
        <select value={props.category} onChange={(event) => props.onCategory(event.target.value)} className={selectClass}><option value="">すべての分野</option>{questionCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={props.difficulty} onChange={(event) => props.onDifficulty(event.target.value as QuestionDifficulty | "")} className={selectClass}><option value="">すべての難易度</option><option value="basic">basic</option><option value="standard">standard</option><option value="exam">exam</option></select>
        <select value={props.type} onChange={(event) => props.onType(event.target.value as QuestionType | "")} className={selectClass}><option value="">すべての形式</option><option value="choice">4択</option><option value="fill">空欄補充</option><option value="output">実行結果</option><option value="reading">コード読解</option><option value="trueFalse">正誤判定</option></select>
      </div>
      <Button variant="secondary" onClick={props.onRandom}><Shuffle className="h-4 w-4" />ランダム10問</Button>
    </div>
  );
}

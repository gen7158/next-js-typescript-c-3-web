import { Bookmark, Heart, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ReviewList({ reviewCount, favoriteCount, wrongCount }: { reviewCount: number; favoriteCount: number; wrongCount: number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="p-3 text-center"><Bookmark className="mx-auto h-4 w-4 text-warning" /><strong className="mt-2 block text-base">{reviewCount}</strong><span className="text-[9px] text-muted">復習リスト</span></Card>
      <Card className="p-3 text-center"><Heart className="mx-auto h-4 w-4 text-danger" /><strong className="mt-2 block text-base">{favoriteCount}</strong><span className="text-[9px] text-muted">お気に入り</span></Card>
      <Card className="p-3 text-center"><RotateCcw className="mx-auto h-4 w-4 text-cyan" /><strong className="mt-2 block text-base">{wrongCount}</strong><span className="text-[9px] text-muted">間違い履歴</span></Card>
    </div>
  );
}

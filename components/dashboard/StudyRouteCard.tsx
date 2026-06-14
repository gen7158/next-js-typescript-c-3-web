import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StudyRouteCard({ title, description, items, icon: Icon, accent, badge }: { title: string; description: string; items: string[]; icon: LucideIcon; accent: "primary" | "cyan" | "warning"; badge: string }) {
  const colors = { primary: "from-primary/20 text-[#b0a8ff]", cyan: "from-cyan/15 text-cyan", warning: "from-warning/15 text-warning" };
  return (
    <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className={cn("h-24 bg-gradient-to-br to-transparent p-5", colors[accent])}>
        <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-lg bg-background/50"><Icon className="h-5 w-5" /></span><Badge>{badge}</Badge></div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 min-h-10 text-xs leading-5 text-muted">{description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">{items.slice(0, 4).map((item) => <Badge key={item} className="font-normal">{item}</Badge>)}</div>
        <Link href="/learn" className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold">このルートで始める <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-white" /></Link>
      </div>
    </Card>
  );
}

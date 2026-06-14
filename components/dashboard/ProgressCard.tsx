import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProgressCard({ label, value, note, icon: Icon, tone = "primary" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: "primary" | "cyan" | "success" | "warning" }) {
  const tones = { primary: "bg-primary/12 text-[#aca3ff]", cyan: "bg-cyan/10 text-cyan", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning" };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div><p className="text-[11px] font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[10px] text-muted">{note}</p></div>
        <span className={cn("grid h-9 w-9 place-items-center rounded-lg", tones[tone])}><Icon className="h-4 w-4" /></span>
      </div>
    </Card>
  );
}

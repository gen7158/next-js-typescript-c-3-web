import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-md border border-border bg-panel px-2 py-1 text-[11px] font-semibold text-muted", className)} {...props} />;
}

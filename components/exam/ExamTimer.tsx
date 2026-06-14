"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExamTimer({ durationSeconds, onTimeUp }: { durationSeconds: number; onTimeUp: () => void }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onTimeUp]);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return <div className={cn("flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 font-mono text-sm font-bold", remaining < 300 && "border-danger/40 bg-danger/10 text-danger")}><Clock3 className="h-4 w-4" />{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>;
}

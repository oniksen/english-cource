import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SkillStatProps {
  name: string;
  value: number;
  max?: number;
  icon?: ReactNode;
}

const skillColors: Record<string, string> = {
  grammar: "bg-amber-500",
  vocabulary: "bg-cyan-500",
  listening: "bg-green-500",
  reading: "bg-blue-500",
  speaking: "bg-purple-500",
  writing: "bg-pink-500",
  pronunciation: "bg-orange-500",
};

export function SkillStat({
  name,
  value,
  max = 100,
  icon,
}: SkillStatProps) {
  const pct = Math.min((value / max) * 100, 100);
  const color = skillColors[name.toLowerCase()] ?? "bg-primary";

  return (
    <div className="flex items-center gap-2">
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

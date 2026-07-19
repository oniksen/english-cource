import { cn } from "@/lib/utils";

interface XpBarProps {
  current: number;
  max: number;
  label?: string;
  variant?: "xp" | "health" | "mana";
}

const barClasses = {
  xp: "rpg-xp-bar",
  health: "rpg-health-bar",
  mana: "rpg-mana-bar",
} as const;

export function XpBar({ current, max, label, variant = "xp" }: XpBarProps) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", barClasses[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {current}/{max}
      </span>
    </div>
  );
}

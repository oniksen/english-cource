"use client";

import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface BossHealthBarProps {
  current: number;
  max: number;
  name: string;
  bossTitle?: string;
}

export function BossHealthBar({
  current,
  max,
  name,
  bossTitle,
}: BossHealthBarProps) {
  const pct = max > 0 ? Math.max((current / max) * 100, 0) : 0;
  const prevPct = max > 0 ? ((current + 1) / max) * 100 : 0;
  const tookDamage = pct < prevPct;

  return (
    <motion.div
      animate={tookDamage ? { x: [0, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="rpg-card-border"
    >
      <div className="rounded-xl bg-card p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Skull className="shrink-0 size-5 text-destructive" />
            <span className="font-heading text-sm truncate text-foreground">
              {name}
            </span>
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-destructive">
            {Math.ceil(current)} / {max} HP
          </span>
        </div>

        {bossTitle && (
          <p className="text-xs text-muted-foreground">{bossTitle}</p>
        )}

        <div className="relative h-4 w-full overflow-hidden rounded-md bg-destructive/20 ring-1 ring-destructive/30">
          <div
            className={cn(
              "h-full rounded-md transition-all duration-500 ease-out",
              pct > 60
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : pct > 30
                  ? "bg-gradient-to-r from-red-600 to-red-400"
                  : "bg-destructive",
              pct <= 30 && "animate-pulse",
            )}
            style={{ width: `${pct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.round(pct)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

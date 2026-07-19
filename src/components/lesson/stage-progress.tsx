"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StageProgressProps {
  current: number;
  total: number;
}

export function StageProgress({ current, total }: StageProgressProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        Stage {current + 1} of {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            layout
            initial={false}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i < current && "bg-amber-500",
              i === current && "bg-cyan-400 shadow-[0_0_6px] shadow-cyan-400/60",
              i > current && "bg-muted-foreground/20",
            )}
            style={{ width: i === current ? 16 : total > 12 ? 6 : 10 }}
          />
        ))}
      </div>
    </div>
  );
}

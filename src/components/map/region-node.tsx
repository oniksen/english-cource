"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface RegionNodeProps {
  code: string;
  title: string;
  progress: number;
  locked?: boolean;
  highlighted?: boolean;
}

const TIER_COLORS: Record<string, { ring: string; text: string; glow: string; stroke: string }> = {
  A: {
    ring: "border-amber-500/70",
    text: "text-amber-400",
    glow: "shadow-[0_0_15px_oklch(0.75_0.15_85/0.4),0_0_30px_oklch(0.75_0.15_85/0.15)]",
    stroke: "stroke-amber-400",
  },
  B: {
    ring: "border-cyan-500/70",
    text: "text-cyan-400",
    glow: "shadow-[0_0_15px_oklch(0.72_0.18_200/0.4),0_0_30px_oklch(0.72_0.18_200/0.15)]",
    stroke: "stroke-cyan-400",
  },
  C: {
    ring: "border-purple-500/70",
    text: "text-purple-400",
    glow: "shadow-[0_0_15px_oklch(0.65_0.2_310/0.4),0_0_30px_oklch(0.65_0.2_310/0.15)]",
    stroke: "stroke-purple-400",
  },
};

const R = 38;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function RegionNode({ code, title, progress, locked, highlighted }: RegionNodeProps) {
  const router = useRouter();
  const tier = (code.charAt(0) ?? "A").toUpperCase();
  const colors = TIER_COLORS[tier] ?? TIER_COLORS.A;
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(progress, 100) / 100);

  return (
    <button
      type="button"
      onClick={() => {
        if (!locked) router.push(`/levels/${code.toLowerCase()}`);
      }}
      disabled={locked}
      className={cn(
        "group flex flex-col items-center gap-2 transition-all duration-300",
        locked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-full border-2 bg-gray-900/80 transition-all duration-300",
          locked ? "border-gray-700" : colors.ring,
          !locked && highlighted && colors.glow,
          !locked && "group-hover:scale-110 group-hover:shadow-lg",
        )}
      >
        <svg
          className="absolute inset-0 size-full -rotate-90"
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            strokeWidth="3"
            className={locked ? "stroke-gray-700" : "stroke-gray-700/30"}
          />
          {!locked && (
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="3"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={cn("transition-all duration-700", colors.stroke)}
            />
          )}
        </svg>
        <span
          className={cn(
            "font-heading text-lg font-bold transition-colors",
            locked ? "text-gray-600" : colors.text,
          )}
        >
          {code}
        </span>
      </div>
      <span
        className={cn(
          "max-w-20 text-center text-xs font-medium transition-colors",
          locked ? "text-gray-600" : "text-muted-foreground",
        )}
      >
        {title}
      </span>
    </button>
  );
}

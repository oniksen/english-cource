"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface ActivityCalendarProps {
  data: Record<string, number>;
}

export function ActivityCalendar({ data }: ActivityCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const days: { date: string; level: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = data[key] ?? 0;
      days.push({ date: key, level: Math.min(Math.ceil(count / 2), 4) });
    }
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const [tooltip, setTooltip] = useState<string | null>(null);

  const levelColors = [
    "bg-muted-foreground/10",
    "bg-amber-900/30",
    "bg-amber-700/40",
    "bg-amber-500/50",
    "bg-amber-400/70",
  ];

  return (
    <div className="relative">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn("size-3 rounded-sm cursor-pointer transition-colors", levelColors[day.level])}
                onMouseEnter={() => setTooltip(`${day.date}: ${data[day.date] ?? 0} activities`)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
}

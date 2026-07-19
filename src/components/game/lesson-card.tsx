"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonData {
  id: string;
  title: string;
  description: string;
  order_index: number;
  xp_reward: number;
}

interface LessonCardProps {
  lesson: LessonData;
  completed: boolean;
  locked: boolean;
  progress?: number;
  isFirstUnlocked?: boolean;
}

function DifficultyStars({ orderIndex }: { orderIndex: number }) {
  const stars = Math.min(Math.max(Math.ceil(orderIndex / 3), 1), 5);
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: stars }, (_, i) => (
        <span key={i} className="text-amber-400 text-xs">★</span>
      ))}
    </span>
  );
}

export function LessonCard({
  lesson,
  completed,
  locked,
  progress,
  isFirstUnlocked,
}: LessonCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={locked ? undefined : { scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all",
        locked
          ? "border-border/50 opacity-50"
          : completed
            ? "border-success/30 rpg-glow-success"
            : isFirstUnlocked
              ? "border-primary rpg-glow cursor-pointer"
              : "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 shrink-0">
          {completed ? (
            <CheckCircle2 className="size-5 text-success" />
          ) : locked ? (
            <Lock className="size-5 text-muted-foreground" />
          ) : (
            <Sword className="size-5 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              "font-heading text-sm font-medium truncate",
              completed ? "text-muted-foreground line-through" : "text-foreground",
            )}>
              {lesson.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <DifficultyStars orderIndex={lesson.order_index} />
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                <Zap className="size-3" />
                {lesson.xp_reward}
              </span>
            </div>
          </div>

          {!locked && lesson.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {lesson.description}
            </p>
          )}

          {locked && (
            <p className="text-xs text-muted-foreground/60">Complete previous lesson to unlock</p>
          )}

          {!locked && !completed && progress !== undefined && progress > 0 && (
            <div className="mt-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

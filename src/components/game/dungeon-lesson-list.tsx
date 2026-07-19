"use client";

import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonCard } from "@/components/game/lesson-card";

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  xp_reward: number;
}

type UserProgress = { completed: boolean; score?: number };

interface DungeonLessonListProps {
  lessons: Lesson[];
  userProgress: Record<string, UserProgress>;
  moduleTitle: string;
  moduleIcon?: string;
}

export function DungeonLessonList({
  lessons,
  userProgress,
  moduleTitle,
  moduleIcon,
}: DungeonLessonListProps) {
  const sorted = [...lessons].sort((a, b) => a.order_index - b.order_index);
  const firstUnlockedIndex = sorted.findIndex(
    (l) => !userProgress[l.id]?.completed && !sorted.find(
      (prev) => prev.order_index < l.order_index && !userProgress[prev.id]?.completed,
    ),
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {moduleIcon ? (
            <span className="text-lg">{moduleIcon}</span>
          ) : (
            <ScrollText className="size-4" />
          )}
        </div>
        <h2 className="font-heading text-lg text-primary">{moduleTitle}</h2>
      </motion.div>

      <div className="relative">
        <div className="absolute left-[19.5px] top-0 h-full w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

        <div className="space-y-3 pl-10">
          {sorted.map((lesson, i) => {
            const progress = userProgress[lesson.id];
            const completed = progress?.completed ?? false;
            const prevComplete =
              i === 0
                ? true
                : sorted.slice(0, i).every((l) => userProgress[l.id]?.completed);
            const locked = !prevComplete && !completed;
            const isFirstUnlocked =
              !completed && !locked && i === firstUnlockedIndex;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                <div
                  className={cn(
                    "absolute -left-[30px] top-5 size-3 rounded-full border-2",
                    completed
                      ? "border-success bg-success"
                      : locked
                        ? "border-muted-foreground/30 bg-card"
                        : "border-primary bg-primary shadow-[0_0_6px] shadow-primary/50",
                  )}
                />
                <LessonCard
                  lesson={lesson}
                  completed={completed}
                  locked={locked}
                  progress={progress?.score ? progress.score / 100 : undefined}
                  isFirstUnlocked={isFirstUnlocked}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

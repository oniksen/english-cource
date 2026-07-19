"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DailyQuestWithProgress } from "@/lib/quests/daily";

interface DailyQuestsProps {
  quests: DailyQuestWithProgress[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rpg-card-border"
    >
      <div className="rounded-xl bg-card p-4">
        <h3 className="font-heading mb-4 text-lg text-primary">
          Daily Quests
        </h3>
        <div className="space-y-3">
          {quests.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No quests available today.
            </p>
          )}
          {quests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                quest.completed
                  ? "border-success/30 bg-success/5"
                  : "border-border",
              )}
            >
              {quest.completed ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" />
              ) : (
                <div className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      quest.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {quest.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/30 text-amber-400"
                  >
                    <Zap className="size-3" />
                    {quest.xp_reward} XP
                  </Badge>
                </div>

                {quest.description && (
                  <p className="text-xs text-muted-foreground">
                    {quest.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        quest.completed ? "bg-success" : "bg-primary",
                      )}
                      style={{
                        width: `${Math.min((quest.progress / quest.required_count) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {quest.progress}/{quest.required_count}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

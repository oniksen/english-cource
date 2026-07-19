"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap, Sparkles, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  category: string;
  required_count: number;
  xp_reward: number | null;
  is_hidden: boolean;
}

export interface AchievementProgress {
  current_count: number | null;
  unlocked_at: string | null;
}

interface AchievementCardProps {
  achievement: Achievement;
  progress?: AchievementProgress | null;
}

export function AchievementCard({ achievement, progress }: AchievementCardProps) {
  const unlocked = !!progress?.unlocked_at;
  const currentCount = progress?.current_count ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rpg-card-border",
        unlocked ? "rpg-glow-success" : "opacity-60",
      )}
    >
      <div className={cn(
        "relative rounded-xl bg-card p-4 transition-all",
        unlocked && "bg-success/5",
      )}>
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            {unlocked ? (
              <CheckCircle2 className="size-6 text-success" />
            ) : (
              <Lock className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className={cn(
                "font-heading text-sm font-medium",
                unlocked ? "text-success" : "text-muted-foreground",
              )}>
                {achievement.is_hidden && !unlocked ? "???" : achievement.title}
              </h4>

              {achievement.xp_reward && (
                <span className="inline-flex items-center gap-1 shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                  <Zap className="size-3" />
                  {achievement.xp_reward}
                </span>
              )}
            </div>

            {achievement.is_hidden && !unlocked && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <EyeOff className="size-3" />
                Hidden achievement
              </div>
            )}

            {(!achievement.is_hidden || unlocked) && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              {unlocked ? (
                <span className="inline-flex items-center gap-1 text-xs text-success">
                  <Sparkles className="size-3" />
                  Unlocked {new Date(progress!.unlocked_at!).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  {achievement.is_hidden ? "???" : `${currentCount}/${achievement.required_count}`}
                </span>
              )}
            </div>

            {!unlocked && !achievement.is_hidden && achievement.required_count > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((currentCount / achievement.required_count) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Trophy, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StageProgress } from "./stage-progress";
import { StageRenderer } from "./stage-renderer";

interface StageBase {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  order_index: number;
  is_active: boolean;
}

interface StageNavigatorProps {
  stages: StageBase[];
  initialStageIndex: number;
  lessonId: string;
  moduleId?: string;
  userId: string;
  completedStageIds: string[];
  xpReward: number;
}

const XP_PER_STAGE = 10;

export function StageNavigator({
  stages,
  initialStageIndex,
  lessonId,
  moduleId,
  userId,
  completedStageIds,
  xpReward,
}: StageNavigatorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentIndex, setCurrentIndex] = useState(initialStageIndex);
  const [direction, setDirection] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(
    new Set(completedStageIds),
  );
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentStage = stages[currentIndex];
  const isLastStage = currentIndex === stages.length - 1;

  const handleComplete = useCallback(
    async (correct: number, total: number) => {
      setTotalCorrect((c) => c + correct);
      setTotalQuestions((q) => q + total);
      setCompletedStages((prev) => new Set(prev).add(currentStage.id));
      setSubmitting(true);

      try {
        await supabase.from("user_progress").upsert(
          {
            stage_id: currentStage.id,
            user_id: userId,
            completed_at: new Date().toISOString(),
            score: total > 0 ? Math.round((correct / total) * 100) : 0,
            xp_earned: Math.round(XP_PER_STAGE * (correct / Math.max(total, 1))),
            attempts: 1,
          },
          { onConflict: "stage_id,user_id" },
        );
      } catch {
        // silently fail save
      }

      setSubmitting(false);

      if (isLastStage) {
        setShowSummary(true);
      } else {
        setDirection(1);
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentStage.id, userId, isLastStage, supabase],
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleGoToModule = useCallback(() => {
    if (moduleId) {
      router.push(`/modules/${moduleId}`);
    } else {
      router.push("/map");
    }
  }, [moduleId, router]);

  const pct = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;
  const earnedXp = Math.round(xpReward * (pct / 100));

  return (
    <div className="space-y-6">
      <StageProgress current={currentIndex} total={stages.length} />

      <AnimatePresence mode="wait" custom={direction}>
        {!showSummary ? (
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="rpg-card-border"
          >
            <div className="rounded-xl bg-card p-6">
              <div className="mb-4">
                <h2 className="font-heading text-base text-primary">
                  {currentStage.title}
                </h2>
              </div>
              <StageRenderer
                stage={currentStage}
                stages={stages}
                onComplete={handleComplete}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rpg-card-border"
          >
            <div className="rounded-xl bg-card p-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20">
                  <Trophy className="size-8 text-amber-400" />
                </div>
              </div>
              <h2 className="font-heading text-xl text-amber-400">
                Lesson Complete!
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 rounded-lg bg-muted p-3">
                  <p className="text-2xl font-bold text-foreground">
                    {totalCorrect}/{totalQuestions}
                  </p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="space-y-1 rounded-lg bg-muted p-3">
                  <p className="text-2xl font-bold text-success">{pct}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="space-y-1 rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-400">
                    <Zap className="size-5" />
                    {earnedXp}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0 || showSummary}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {showSummary ? (
          <Button onClick={handleGoToModule}>
            <CheckCircle2 className="size-4" />
            Return to Module
          </Button>
        ) : isLastStage && completedStages.has(currentStage.id) ? (
          <Button onClick={() => setShowSummary(true)}>
            <Trophy className="size-4" />
            View Results
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">
            Complete the stage to continue
          </div>
        )}
      </div>
    </div>
  );
}

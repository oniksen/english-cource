"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer, CheckCircle2, XCircle, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BossHealthBar } from "@/components/game/boss-health-bar";

interface BossContent {
  prompt: string;
  stages_covered: number[];
}

interface StageBase {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  order_index: number;
  is_active: boolean;
}

interface BossStageProps {
  content: BossContent;
  stages: StageBase[];
  onComplete: (correct: number, total: number) => void;
}

interface Question {
  type: string;
  prompt: string;
  answer: string;
}

const BOSS_HP = 100;
const BOSS_NAME = "Dungeon Guardian";
const MAX_LIVES = 3;
const DAMAGE_PER_HIT = 20;
const TIME_LIMIT = 60;

function extractQuestions(stages: StageBase[], covered: number[]): Question[] {
  const qs: Question[] = [];
  for (const stage of stages) {
    if (!covered.includes(stage.order_index) || !stage.is_active) continue;
    const content = stage.content as Record<string, unknown>;

    if (stage.type === "vocabulary") {
      const words = content.words as Array<{ word: string; translation: string }> | undefined;
      if (words) {
        for (const w of words) {
          qs.push({ type: "vocabulary", prompt: w.word, answer: w.translation.toLowerCase() });
        }
      }
    } else if (stage.type === "grammar") {
      const exercises = content.exercises as string[] | undefined;
      if (exercises) {
        for (const ex of exercises) {
          const match = ex.match(/\(([^)]+)\)/);
          if (match) {
            const clean = ex.replace(/\s*\([^)]*\)\s*$/, "").trim();
            qs.push({ type: "grammar", prompt: clean, answer: match[1].trim().toLowerCase() });
          }
        }
      }
    } else if (stage.type === "reading" || stage.type === "listening") {
      const questions = content.questions as string[] | undefined;
      if (questions) {
        for (const q of questions) {
          const match = q.match(/\(([^)]+)\)/);
          if (match) {
            const clean = q.replace(/\s*\([^)]*\)\s*$/, "").trim();
            qs.push({ type: stage.type, prompt: clean, answer: match[1].trim().toLowerCase() });
          }
        }
      }
    }
  }
  return qs.sort(() => Math.random() - 0.5).slice(0, 10);
}

export function BossStage({ content, stages, onComplete }: BossStageProps) {
  const questions = useMemo(
    () => extractQuestions(stages, content.stages_covered),
    [stages, content.stages_covered],
  );

  const [index, setIndex] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          setWon(false);
          onComplete(score, questions.length);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished]);

  const currentQuestion = questions[index];
  const isLast = index >= questions.length - 1;

  const handleCheck = useCallback(() => {
    if (checked || finished) return;
    setChecked(true);
    const isCorrect =
      answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    if (isCorrect) {
      const newHp = Math.max(0, bossHp - DAMAGE_PER_HIT);
      setBossHp(newHp);
      setScore((s) => s + 1);
      if (newHp <= 0) {
        setShowTransition(true);
        setTimeout(() => {
          setFinished(true);
          setWon(true);
          onComplete(score + 1, questions.length);
        }, 1500);
        return;
      }
    } else {
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setTimeout(() => {
            setFinished(true);
            setWon(false);
            onComplete(score, questions.length);
          }, 800);
        }
        return next;
      });
    }
  }, [checked, finished, answer, currentQuestion, bossHp, score, questions.length, onComplete]);

  const handleNext = useCallback(() => {
    if (finished) return;
    if (isLast) {
      setFinished(true);
      setWon(bossHp <= 0);
      onComplete(score, questions.length);
    } else {
      setIndex((i) => i + 1);
      setAnswer("");
      setChecked(false);
    }
  }, [finished, isLast, bossHp, score, questions.length, onComplete]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No questions available for this boss fight.
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-8"
      >
        {won ? (
          <>
            <div className="flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-success/20">
                <CheckCircle2 className="size-10 text-success" />
              </div>
            </div>
            <h2 className="font-heading text-2xl text-success">Victory!</h2>
            <p className="text-muted-foreground">
              You defeated the {BOSS_NAME}!
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-amber-400">
              <span className="font-bold">{score}</span>
              <span className="text-sm">/ {questions.length} correct</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-destructive/20">
                <Skull className="size-10 text-destructive" />
              </div>
            </div>
            <h2 className="font-heading text-2xl text-destructive">Defeated</h2>
            <p className="text-muted-foreground">
              {lives <= 0
                ? "You lost all your lives!"
                : "Time ran out!"}
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-amber-400">
              <span className="font-bold">{score}</span>
              <span className="text-sm">/ {questions.length} correct</span>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <Skull className="mx-auto size-16 text-destructive" />
              <p className="font-heading text-2xl text-destructive">Boss Defeated!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {content.prompt}
        </p>
      </div>

      <BossHealthBar
        current={bossHp}
        max={BOSS_HP}
        name={BOSS_NAME}
        bossTitle="Final Challenge"
      />

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <Heart
              key={i}
              className={cn(
                "size-4",
                i < lives
                  ? "text-red-500 fill-red-500"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 tabular-nums">
          <Timer
            className={cn(
              "size-4",
              timeLeft <= 10 ? "text-destructive animate-pulse" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              timeLeft <= 10 ? "text-destructive font-bold" : "text-muted-foreground",
            )}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Question {index + 1} of {questions.length}
            </p>
            <p className="text-base font-heading text-foreground">
              {currentQuestion.prompt}
            </p>
            {checked && (
              <p className="text-xs text-muted-foreground">
                Type: {currentQuestion.type}
              </p>
            )}
          </div>

          <div className="mx-auto max-w-xs">
            <input
              value={answer}
              onChange={(e) => {
                if (!checked) setAnswer(e.target.value);
              }}
              placeholder="Type your answer..."
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-center shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                checked &&
                  (answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
                    ? "border-success ring-success/30"
                    : "border-destructive ring-destructive/30"),
              )}
              disabled={checked}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !checked) handleCheck();
              }}
            />
          </div>

          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 text-sm",
                answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-2">
                {answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() ? (
                  <>
                    <CheckCircle2 className="size-4 text-success" />
                    <span className="text-success">-{DAMAGE_PER_HIT} HP!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-destructive" />
                    <span className="text-destructive">
                      Expected: "{currentQuestion.answer}"
                    </span>
                  </>
                )}
              </div>
              <Button size="sm" onClick={handleNext}>
                {isLast ? "See Results" : "Next"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!checked && !finished && (
        <div className="flex justify-center">
          <Button onClick={handleCheck} disabled={!answer.trim()} size="lg">
            Attack!
          </Button>
        </div>
      )}
    </div>
  );
}

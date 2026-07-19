"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GrammarContent {
  prompt: string;
  rules?: string[];
  exercises: string[];
}

interface GrammarStageProps {
  content: GrammarContent;
  onComplete: (correct: number, total: number) => void;
}

function extractAnswer(exercise: string): string {
  const match = exercise.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : "";
}

function cleanPrompt(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function GrammarStage({ content, onComplete }: GrammarStageProps) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const exercise = content.exercises[index];
  const expected = extractAnswer(exercise);
  const prompt = cleanPrompt(exercise);

  const handleCheck = useCallback(() => {
    if (checked) return;
    setChecked(true);
    const isCorrect =
      answer.trim().toLowerCase() === expected.toLowerCase();
    if (isCorrect) setCorrectCount((c) => c + 1);
  }, [checked, answer, expected]);

  const handleNext = useCallback(() => {
    if (index + 1 < content.exercises.length) {
      setIndex((i) => i + 1);
      setAnswer("");
      setChecked(false);
    } else {
      onComplete(correctCount, content.exercises.length);
    }
  }, [index, content.exercises.length, onComplete, correctCount, answer, expected]);

  const isCorrect = checked && answer.trim().toLowerCase() === expected.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {content.prompt}
        </p>
        <p className="text-sm text-muted-foreground">
          Fill in the blank with the correct word
        </p>
      </div>

      {content.rules && index === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            Rules
          </p>
          <ul className="space-y-1">
            {content.rules.map((rule, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {rule}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-lg font-heading text-foreground mb-3">
              {prompt}
            </p>
            <div className="mx-auto max-w-xs">
              <Input
                value={answer}
                onChange={(e) => {
                  if (!checked) setAnswer(e.target.value);
                }}
                placeholder="Type your answer..."
                className={cn(
                  "text-center",
                  checked &&
                    (isCorrect
                      ? "border-success ring-success/30"
                      : "border-destructive ring-destructive/30"),
                )}
                disabled={checked}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !checked) handleCheck();
                }}
              />
            </div>
          </div>

          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 text-sm",
                isCorrect
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
                <span className={isCorrect ? "text-success" : "text-destructive"}>
                  {isCorrect ? "Correct!" : `Expected: "${expected}"`}
                </span>
              </div>
              <Button size="sm" onClick={handleNext}>
                {index + 1 < content.exercises.length ? "Next" : "Finish"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!checked && (
        <div className="flex justify-center">
          <Button onClick={handleCheck} disabled={!answer.trim()}>
            Check Answer
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1">
        {content.exercises.map((_, i) => (
          <div
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i < index + (checked ? 1 : 0)
                ? "bg-amber-500"
                : i === index
                  ? "bg-cyan-400"
                  : "bg-muted-foreground/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}

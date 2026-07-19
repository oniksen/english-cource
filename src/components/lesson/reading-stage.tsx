"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReadingContent {
  text: string;
  questions: string[];
}

interface ReadingStageProps {
  content: ReadingContent;
  onComplete: (correct: number, total: number) => void;
}

function extractAnswer(question: string): string {
  const match = question.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : "";
}

function cleanPrompt(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function ReadingStage({ content, onComplete }: ReadingStageProps) {
  const [index, setIndex] = useState(-1);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const startReading = useCallback(() => {
    setIndex(0);
  }, []);

  if (index === -1) {
    return (
      <div className="space-y-6">
        <div className={cn("rounded-xl bg-card p-5 rpg-card-border")}>
          <div className="rounded-xl bg-card/50 p-4 whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
            {content.text}
          </div>
        </div>
        <div className="flex justify-center">
          <Button onClick={startReading} size="lg">
            Start Questions
          </Button>
        </div>
      </div>
    );
  }

  const question = content.questions[index];
  const expected = extractAnswer(question);
  const prompt = cleanPrompt(question);
  const answer = answers[index] ?? "";
  const isChecked = checked[index] ?? false;
  const isCorrect =
    isChecked && answer.trim().toLowerCase() === expected.toLowerCase();

  const handleCheck = useCallback(() => {
    setChecked((c) => ({ ...c, [index]: true }));
    if (answer.trim().toLowerCase() === expected.toLowerCase()) {
      setCorrectCount((c) => c + 1);
    }
  }, [index, answer, expected]);

  const handleNext = useCallback(() => {
    if (index + 1 < content.questions.length) {
      setIndex((i) => i + 1);
    } else {
      onComplete(correctCount + (isCorrect ? 1 : 0), content.questions.length);
    }
  }, [index, content.questions.length, onComplete, correctCount, isCorrect]);

  return (
    <div className="space-y-6">
      <div className={cn("rounded-xl bg-card/50 p-4 text-sm leading-relaxed text-card-foreground border border-border")}>
        {content.text}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Question {index + 1} of {content.questions.length}
            </p>
            <p className="text-base font-heading text-foreground mb-3">
              {prompt}
            </p>
            <div className="mx-auto max-w-xs">
              <Input
                value={answer}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [index]: e.target.value }))
                }
                placeholder="Type your answer..."
                className={cn(
                  "text-center",
                  isChecked &&
                    (isCorrect
                      ? "border-success ring-success/30"
                      : "border-destructive ring-destructive/30"),
                )}
                disabled={isChecked}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isChecked) handleCheck();
                }}
              />
            </div>
          </div>

          {isChecked && (
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
                {index + 1 < content.questions.length ? "Next" : "Finish"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!isChecked && (
        <div className="flex justify-center">
          <Button onClick={handleCheck} disabled={!answer.trim()}>
            Check Answer
          </Button>
        </div>
      )}
    </div>
  );
}

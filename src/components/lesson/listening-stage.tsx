"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListeningContent {
  audio_prompt: string;
  script: string;
  questions: string[];
}

interface ListeningStageProps {
  content: ListeningContent;
  onComplete: (correct: number, total: number) => void;
}

function extractAnswer(question: string): string {
  const match = question.match(/\(([^)]+)\)/);
  return match ? match[1].trim().toLowerCase() : "";
}

const GAP_WORDS = new Set([
  "hello", "name", "mike", "sarah", "friend", "goodbye",
  "student", "teacher", "doctor", "from", "am", "is", "are",
  "kate", "spell", "twenty", "thirty", "forty", "fifty",
  "breakfast", "lunch", "dinner", "school", "work", "home",
  "coffee", "water", "milk", "tea", "bread", "rice",
  "morning", "afternoon", "evening", "night",
  "mexico", "canada", "spain", "france", "american",
  "always", "usually", "often", "sometimes", "never",
  "pen", "book", "desk", "chair", "table", "bag", "door",
  "red", "blue", "green", "yellow", "black", "white",
]);

interface Gap {
  index: number;
  original: string;
  lower: string;
  before: string;
  after: string;
}

export function ListeningStage({ content, onComplete }: ListeningStageProps) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const gaps: Gap[] = useMemo(() => {
    const words = content.script.split(/\s+/);
    const result: Gap[] = [];
    let gapIdx = 0;
    for (let i = 0; i < words.length; i++) {
      const clean = words[i].replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (GAP_WORDS.has(clean)) {
        const before = words.slice(Math.max(0, i - 1), i).join(" ");
        const after = words.slice(i + 1, i + 2).join(" ");
        result.push({
          index: gapIdx++,
          original: words[i],
          lower: clean,
          before,
          after,
        });
      }
    }
    if (result.length === 0) {
      const pivot = Math.floor(words.length / 2);
      result.push({
        index: 0,
        original: words[pivot] ?? "",
        lower: (words[pivot] ?? "").replace(/[^a-zA-Z'-]/g, "").toLowerCase(),
        before: words.slice(Math.max(0, pivot - 1), pivot).join(" "),
        after: words.slice(pivot + 1, pivot + 2).join(" "),
      });
    }
    return result;
  }, [content.script]);

  const qIdx = Math.min(index, content.questions.length - 1);
  const question = content.questions[qIdx];
  const expected = extractAnswer(question);
  const prompt = question.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const gap = gaps[index];
  const answer = answers[index] ?? "";
  const isCorrect =
    checked && answer.trim().toLowerCase() === expected.toLowerCase();

  const handleCheck = useCallback(() => {
    setChecked(true);
    if (answer.trim().toLowerCase() === expected.toLowerCase()) {
      setCorrectCount((c) => c + 1);
    }
  }, [answer, expected]);

  const handleNext = useCallback(() => {
    if (index + 1 < Math.max(gaps.length, content.questions.length)) {
      setIndex((i) => i + 1);
      setChecked(false);
    } else {
      const isCurrect =
        answer.trim().toLowerCase() === expected.toLowerCase();
      onComplete(correctCount + (isCurrect ? 1 : 0), Math.max(gaps.length, content.questions.length));
    }
  }, [index, gaps.length, content.questions.length, onComplete, correctCount, answer, expected]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="size-4 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {content.audio_prompt}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Listen to the script and fill in the missing word
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm leading-relaxed text-card-foreground">
          {content.script.split(/\s+/).map((word, i) => {
            const clean = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
            const isGap = GAP_WORDS.has(clean) && gaps.some((g) => g.index === index && g.lower === clean);
            if (isGap) {
              return (
                <span
                  key={i}
                  className="inline-block mx-0.5 border-b-2 border-dashed border-cyan-400 min-w-[60px] text-center text-cyan-400"
                >
                  {answer || "______"}
                </span>
              );
            }
            return (
              <span key={i} className="mx-0.5">
                {word}{" "}
              </span>
            );
          })}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Gap {index + 1} of {Math.max(gaps.length, content.questions.length)}
            </p>
            <p className="text-base font-heading text-foreground">{prompt}</p>
            <div className="mx-auto max-w-xs">
              <Input
                value={answer}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [index]: e.target.value }))
                }
                placeholder="Type the missing word..."
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
                {index + 1 < Math.max(gaps.length, content.questions.length)
                  ? "Next"
                  : "Finish"}
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
    </div>
  );
}

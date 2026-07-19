"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VocabularyContent {
  prompt: string;
  words: { word: string; translation: string; example?: string }[];
}

interface VocabularyStageProps {
  content: VocabularyContent;
  onComplete: (correct: number, total: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function VocabularyStage({ content, onComplete }: VocabularyStageProps) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentWord = content.words[index];

  const options = useMemo(() => {
    const correct = currentWord.translation;
    const others = content.words
      .filter((w) => w.translation !== correct)
      .map((w) => w.translation);
    const pool = shuffle([correct, ...shuffle(others).slice(0, 3)]);
    while (pool.length < 4) pool.push("—");
    return shuffle(pool);
  }, [index, content.words, currentWord]);

  const handleSelect = useCallback(
    (choice: string) => {
      if (showResult) return;
      setSelected(choice);
      setShowResult(true);
      if (choice === currentWord.translation) {
        setCorrectCount((c) => c + 1);
      }
    },
    [showResult, currentWord],
  );

  const handleNext = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    if (index + 1 < content.words.length) {
      setIndex((i) => i + 1);
    } else {
      onComplete(correctCount, content.words.length);
    }
  }, [index, content.words.length, onComplete, correctCount, selected, currentWord]);

  const isCorrect = selected === currentWord.translation;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {content.prompt}
        </p>
        <p className="text-2xl font-heading text-foreground">
          {currentWord.word}
        </p>
        {currentWord.example && (
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{currentWord.example}&rdquo;
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence mode="popLayout">
          {options.map((choice, i) => {
            let variant:
              | "default"
              | "outline"
              | "secondary"
              | "destructive" = "outline";
            if (showResult) {
              if (choice === currentWord.translation) variant = "default";
              else if (choice === selected) variant = "destructive";
            }
            return (
              <motion.div
                key={`${index}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Button
                  variant={variant}
                  className="w-full h-12 text-sm"
                  onClick={() => handleSelect(choice)}
                  disabled={showResult}
                >
                  {choice}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
              <span
                className={cn(
                  isCorrect ? "text-success" : "text-destructive",
                )}
              >
                {isCorrect
                  ? "Correct!"
                  : `"${currentWord.word}" = ${currentWord.translation}`}
              </span>
            </div>
            <Button size="sm" onClick={handleNext}>
              {index + 1 < content.words.length ? "Next" : "Finish"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-1">
        {content.words.map((_, i) => (
          <div
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i < index + (showResult ? 1 : 0)
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

"use client";

import { Swords, MessageSquare } from "lucide-react";
import { VocabularyStage } from "./vocabulary-stage";
import { GrammarStage } from "./grammar-stage";
import { ReadingStage } from "./reading-stage";
import { ListeningStage } from "./listening-stage";
import { BossStage } from "./boss-stage";

interface StageBase {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  order_index: number;
  is_active: boolean;
}

interface StageRendererProps {
  stage: StageBase;
  stages?: StageBase[];
  onComplete: (correct: number, total: number) => void;
}

type VocabularyContent = Parameters<typeof VocabularyStage>[0]["content"];
type GrammarContent = Parameters<typeof GrammarStage>[0]["content"];
type ReadingContent = Parameters<typeof ReadingStage>[0]["content"];
type ListeningContent = Parameters<typeof ListeningStage>[0]["content"];
type BossContent = Parameters<typeof BossStage>[0]["content"];

export function StageRenderer({ stage, stages = [], onComplete }: StageRendererProps) {
  const { type, content } = stage;

  if (!stage.is_active) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          {type === "speaking" ? (
            <MessageSquare className="size-8 text-muted-foreground" />
          ) : (
            <Swords className="size-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="font-heading text-lg text-muted-foreground">
          {type === "speaking" ? "Speaking" : "Writing"} — Coming Soon
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          This stage type is coming soon with AI-powered review.
        </p>
      </div>
    );
  }

  switch (type) {
    case "vocabulary":
      return (
        <VocabularyStage
          content={content as unknown as VocabularyContent}
          onComplete={onComplete}
        />
      );
    case "grammar":
      return (
        <GrammarStage
          content={content as unknown as GrammarContent}
          onComplete={onComplete}
        />
      );
    case "reading":
      return (
        <ReadingStage
          content={content as unknown as ReadingContent}
          onComplete={onComplete}
        />
      );
    case "listening":
      return (
        <ListeningStage
          content={content as unknown as ListeningContent}
          onComplete={onComplete}
        />
      );
    case "boss":
      return (
        <BossStage
          content={content as unknown as BossContent}
          stages={stages}
          onComplete={onComplete}
        />
      );
    default:
      return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Unknown stage type: {type}
        </div>
      );
  }
}

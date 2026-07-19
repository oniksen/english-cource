import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Skull, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DungeonLessonList } from "@/components/game/dungeon-lesson-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: module } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .single();

  if (!module || !module.is_active) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", id)
    .eq("is_active", true)
    .order("order_index");

  if (!lessons) notFound();

  const lessonIds = lessons.map((l) => l.id);

  const { data: stages } = await supabase
    .from("lesson_stages")
    .select("id, lesson_id")
    .in("lesson_id", lessonIds);

  const stageIds = stages?.map((s) => s.id) ?? [];

  const { data: progress } = stageIds.length > 0
    ? await supabase
        .from("user_progress")
        .select("stage_id, score")
        .eq("user_id", user.id)
        .in("stage_id", stageIds)
    : { data: [] };

  const completedStageIds = new Set(progress?.map((p) => p.stage_id) ?? []);

  const stagesByLesson = new Map<string, string[]>();
  for (const stage of stages ?? []) {
    const arr = stagesByLesson.get(stage.lesson_id) ?? [];
    arr.push(stage.id);
    stagesByLesson.set(stage.lesson_id, arr);
  }

  const userProgress: Record<string, { completed: boolean; score?: number }> = {};
  for (const lesson of lessons) {
    const lessonStageIds = stagesByLesson.get(lesson.id) ?? [];
    const completed = lessonStageIds.length > 0
      ? lessonStageIds.every((sid) => completedStageIds.has(sid))
      : false;
    const lessonProgress = progress?.filter((p) =>
      lessonStageIds.includes(p.stage_id),
    );
    const avgScore =
      lessonProgress && lessonProgress.length > 0
        ? Math.round(
            lessonProgress.reduce((sum, p) => sum + (p.score ?? 0), 0) /
              lessonProgress.length,
          )
        : undefined;
    userProgress[lesson.id] = { completed, score: avgScore };
  }

  const allComplete = lessons.every((l) => userProgress[l.id]?.completed);
  const totalXp = lessons.reduce((sum, l) => sum + (l.xp_reward ?? 0), 0);

  const difficultyLabel = ["Easy", "Normal", "Hard", "Expert", "Master"];

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <Link
        href="/world-map"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to World Map
      </Link>

      <div className="rpg-card-border">
        <div className="rounded-xl bg-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{module.icon ?? "🏰"}</span>
                <h1 className="font-heading text-2xl text-primary">
                  {module.title}
                </h1>
              </div>
              {module.description && (
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {difficultyLabel[module.difficulty ?? 1] ?? "Normal"}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/30 text-amber-400"
            >
              <Zap className="size-3" />
              {totalXp} XP Available
            </Badge>
            <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
              {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
            </Badge>
          </div>
        </div>
      </div>

      <DungeonLessonList
        lessons={lessons}
        userProgress={userProgress}
        moduleTitle={module.title}
        moduleIcon={module.icon ?? undefined}
      />

      <div
        className={`rounded-xl border p-6 text-center transition-all ${
          allComplete
            ? "border-destructive/30 bg-destructive/5 rpg-glow-destructive"
            : "border-border opacity-60"
        }`}
      >
        <Skull className="mx-auto mb-2 size-8 text-destructive" />
        <h3 className="font-heading text-lg text-destructive">Defeat the Boss</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {allComplete
            ? "All lessons complete! The boss awaits your challenge."
            : "Complete all lessons to unlock the boss fight."}
        </p>
        {allComplete && (
          <Button
            variant="destructive"
            className="mt-4"
            size="lg"
            disabled
          >
            <Skull className="size-4" />
            Enter Boss Fight
          </Button>
        )}
      </div>
    </div>
  );
}

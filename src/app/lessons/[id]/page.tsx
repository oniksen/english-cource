import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StageNavigator } from "@/components/lesson/stage-navigator";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, module_id, xp_reward")
    .eq("id", id)
    .single();

  if (!lesson || !lesson.is_active) notFound();

  const { data: stages } = await supabase
    .from("lesson_stages")
    .select("*")
    .eq("lesson_id", id)
    .order("order_index");

  if (!stages || stages.length === 0) notFound();

  const stageIds = stages.map((s) => s.id);

  const { data: progress } = stageIds.length > 0
    ? await supabase
        .from("user_progress")
        .select("stage_id, completed_at")
        .eq("user_id", user.id)
        .in("stage_id", stageIds)
    : { data: [] };

  const completedStageIds = new Set(progress?.map((p) => p.stage_id) ?? []);

  const firstUnlockedIndex = stages.findIndex(
    (s) => !completedStageIds.has(s.id),
  );
  const initialIndex = firstUnlockedIndex >= 0 ? firstUnlockedIndex : 0;

  const locked =
    stages.every((s) => completedStageIds.has(s.id)) && completedStageIds.size > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link
        href={lesson.module_id ? `/modules/${lesson.module_id}` : "/map"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Module
      </Link>

      <div className="space-y-1">
        <h1 className="font-heading text-xl text-primary">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {locked ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Lock className="size-8 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-lg text-muted-foreground">
            All Stages Complete
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You have completed all stages in this lesson. Great work!
          </p>
          <Link
            href={lesson.module_id ? `/modules/${lesson.module_id}` : "/map"}
          >
            Return to Module
          </Link>
        </div>
      ) : (
        <StageNavigator
          stages={stages}
          initialStageIndex={initialIndex}
          lessonId={id}
          moduleId={lesson.module_id ?? undefined}
          userId={user.id}
          completedStageIds={Array.from(completedStageIds)}
          xpReward={lesson.xp_reward ?? 0}
        />
      )}
    </div>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";

const STAGE_TO_SKILL: Record<string, string> = {
  vocabulary: "vocabulary",
  grammar: "grammar",
  reading: "reading",
  listening: "listening",
  speaking: "speaking",
  writing: "writing",
};

export async function updateSkillForStage(stageId: string, score: number, maxScore: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: stage } = await supabase
    .from("lesson_stages")
    .select("type")
    .eq("id", stageId)
    .single();

  if (!stage) throw new Error("Stage not found");

  const skillColumn = STAGE_TO_SKILL[stage.type];
  if (!skillColumn) return { skill: null, points: 0 };

  const pct = maxScore > 0 ? score / maxScore : 0;
  const skillPoints = Math.round(pct * 10);

  const { error } = await supabase.rpc("increment_skill", {
    p_user_id: user.id,
    p_skill: skillColumn,
    p_points: skillPoints,
  });

  if (error) {
    const { data: skills } = await supabase
      .from("user_skills")
      .select(skillColumn)
      .eq("user_id", user.id)
      .single();

    if (skills) {
      const current = (skills as unknown as Record<string, number>)[skillColumn] ?? 0;
      await supabase
        .from("user_skills")
        .update({ [skillColumn]: current + skillPoints })
        .eq("user_id", user.id);
    }
  }

  return { skill: skillColumn, points: skillPoints };
}

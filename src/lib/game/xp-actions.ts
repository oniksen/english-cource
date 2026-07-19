"use server";

import { createClient } from "@/lib/supabase/server";
import { xpToNextLevel } from "./xp";

export async function awardStageXp(stageId: string, score: number, maxScore: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: stage } = await supabase
    .from("lesson_stages")
    .select("type")
    .eq("id", stageId)
    .single();

  if (!stage) throw new Error("Stage not found");

  const pct = maxScore > 0 ? score / maxScore : 0;
  const baseXp = 10;
  const earnedXp = Math.round(baseXp * pct);

  await supabase.from("user_progress").upsert({
    user_id: user.id,
    stage_id: stageId,
    completed_at: new Date().toISOString(),
    xp_earned: earnedXp,
    score,
    attempts: 1,
  }, { onConflict: "user_id, stage_id" });

  const { data: xp } = await supabase
    .from("user_xp")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (xp) {
    const newTotal = xp.total_xp + earnedXp;
    let newLevel = xp.level;
    let newXpToNext = xp.xp_to_next_level;

    while (newLevel < 100 && newTotal >= newXpToNext) {
      newLevel++;
      newXpToNext = xpToNextLevel(newLevel);
    }

    await supabase
      .from("user_xp")
      .update({ total_xp: newTotal, level: newLevel, xp_to_next_level: newXpToNext })
      .eq("user_id", user.id);
  }

  await updateStreak(user.id);

  return { xp_earned: earnedXp, score };
}

async function updateStreak(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: streak } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) return;

  const lastDate = streak.last_active_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = streak.current_streak;
  if (lastDate === yesterday) {
    newStreak++;
  } else if (lastDate !== today) {
    newStreak = 1;
  }

  await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(streak.longest_streak, newStreak),
      last_active_date: today,
    })
    .eq("user_id", userId);
}

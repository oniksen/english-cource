"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkAchievements(userId: string) {
  const supabase = await createClient();

  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*");

  if (!allAchievements) return [];

  const unlocked: string[] = [];

  for (const achievement of allAchievements) {
    let achieved = false;

    switch (achievement.category) {
      case "streak": {
        const { data: streak } = await supabase
          .from("user_streaks")
          .select("current_streak")
          .eq("user_id", userId)
          .single();
        achieved = (streak?.current_streak ?? 0) >= achievement.required_count;
        break;
      }
      case "xp": {
        const { data: xp } = await supabase
          .from("user_xp")
          .select("total_xp")
          .eq("user_id", userId)
          .single();
        achieved = (xp?.total_xp ?? 0) >= achievement.required_count;
        break;
      }
      case "lessons": {
        const { count } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        achieved = (count ?? 0) >= achievement.required_count;
        break;
      }
      case "level": {
        const { data: xp } = await supabase
          .from("user_xp")
          .select("level")
          .eq("user_id", userId)
          .single();
        achieved = (xp?.level ?? 0) >= achievement.required_count;
        break;
      }
      default:
        achieved = false;
    }

    if (achieved) {
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("unlocked_at")
        .eq("user_id", userId)
        .eq("achievement_id", achievement.id)
        .single();

      if (!existing?.unlocked_at) {
        await supabase.from("user_achievements").upsert({
          user_id: userId,
          achievement_id: achievement.id,
          current_count: achievement.required_count,
          unlocked_at: new Date().toISOString(),
        }, { onConflict: "user_id, achievement_id" });

        if (achievement.xp_reward) {
          await supabase.rpc("award_xp", {
            p_user_id: userId,
            p_xp: achievement.xp_reward,
          });
        }

        unlocked.push(achievement.code);
      }
    }
  }

  return unlocked;
}

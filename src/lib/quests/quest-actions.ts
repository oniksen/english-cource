"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function claimQuestReward(questId: string, date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: quest } = await supabase
    .from("user_daily_quests")
    .select("*")
    .eq("user_id", user.id)
    .eq("quest_id", questId)
    .eq("date", date)
    .single();

  if (!quest || !quest.completed) throw new Error("Quest not completed");

  const { data: dailyQuest } = await supabase
    .from("daily_quests")
    .select("xp_reward")
    .eq("id", questId)
    .single();

  if (dailyQuest?.xp_reward) {
    await supabase.rpc("award_xp", {
      p_user_id: user.id,
      p_xp: dailyQuest.xp_reward,
    });
  }

  revalidatePath("/dashboard");
  return { xp_earned: dailyQuest?.xp_reward ?? 0 };
}

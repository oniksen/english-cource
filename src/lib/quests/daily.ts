import type { SupabaseClient } from "@supabase/supabase-js";

export interface DailyQuestWithProgress {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  required_count: number;
  xp_reward: number | null;
  completed: boolean;
}

export async function getDailyQuests(
  supabase: SupabaseClient,
  userId: string,
): Promise<DailyQuestWithProgress[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("user_daily_quests")
    .select("*, daily_quests(*)")
    .eq("user_id", userId)
    .eq("date", today);

  if (existing && existing.length > 0) {
    return (existing as any[]).map((eq) => ({
      id: eq.quest_id,
      title: eq.daily_quests.title,
      description: eq.daily_quests.description,
      progress: eq.progress ?? 0,
      required_count: eq.daily_quests.required_count,
      xp_reward: eq.daily_quests.xp_reward,
      completed: eq.completed ?? false,
    }));
  }

  const { data: available } = await supabase
    .from("daily_quests")
    .select("*")
    .eq("is_active", true);

  if (!available || available.length === 0) return [];

  const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3);

  const assignments = shuffled.map((q: any) => ({
    user_id: userId,
    quest_id: q.id,
    date: today,
    progress: 0,
    completed: false,
  }));

  await supabase.from("user_daily_quests").insert(assignments);

  return shuffled.map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    progress: 0,
    required_count: q.required_count,
    xp_reward: q.xp_reward,
    completed: false,
  }));
}

export async function updateQuestProgress(
  supabase: SupabaseClient,
  userId: string,
  questId: string,
  increment: number,
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const { data: current } = await supabase
    .from("user_daily_quests")
    .select("*, daily_quests(*)")
    .eq("user_id", userId)
    .eq("quest_id", questId)
    .eq("date", today)
    .single();

  if (!current) return;

  const dailyQuest = (current as any).daily_quests;
  const newProgress = Math.min(
    ((current as any).progress ?? 0) + increment,
    dailyQuest.required_count,
  );
  const completed = newProgress >= dailyQuest.required_count;

  await supabase
    .from("user_daily_quests")
    .update({ progress: newProgress, completed })
    .eq("user_id", userId)
    .eq("quest_id", questId)
    .eq("date", today);
}

import { createClient } from "@/lib/supabase/server";
import { CharacterHeader } from "@/components/dashboard/character-header";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { DailyQuests } from "@/components/dashboard/daily-quests";
import { getDailyQuests } from "@/lib/quests/daily";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, xpRes, skillsRes, streaksRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_xp").select("*").eq("user_id", user.id).single(),
    supabase.from("user_skills").select("*").eq("user_id", user.id).single(),
    supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  const profile = profileRes.data;
  const xp = xpRes.data;
  const skills = skillsRes.data;
  const streak = streaksRes.data;

  const quests = await getDailyQuests(supabase, user.id);

  return (
    <div className="space-y-6">
      <CharacterHeader
        profile={{
          username: profile?.username ?? "",
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          title: profile?.title,
        }}
        xp={{
          total_xp: xp?.total_xp ?? 0,
          level: xp?.level ?? 1,
          xp_to_next_level: xp?.xp_to_next_level ?? 100,
        }}
        streak={{ current_streak: streak?.current_streak ?? 0 }}
      />
      <StatsPanel skills={skills} />
      <DailyQuests quests={quests} />
    </div>
  );
}

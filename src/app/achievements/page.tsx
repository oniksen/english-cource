import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { AchievementCard } from "@/components/game/achievement-card";

const categoryLabels: Record<string, string> = {
  streak: "Streak",
  xp: "Experience",
  lessons: "Lessons",
  level: "Level",
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [achievementsRes, progressRes] = await Promise.all([
    supabase.from("achievements").select("*").order("category").order("required_count"),
    supabase
      .from("user_achievements")
      .select("achievement_id, current_count, unlocked_at")
      .eq("user_id", user.id),
  ]);

  const achievements = achievementsRes.data ?? [];
  const userProgress = progressRes.data ?? [];

  const progressMap = new Map(
    userProgress.map((p) => [p.achievement_id, p]),
  );

  const grouped = achievements.reduce<Record<string, typeof achievements>>(
    (acc, a) => {
      const cat = categoryLabels[a.category] ?? a.category;
      (acc[cat] ??= []).push(a);
      return acc;
    },
    {},
  );

  const unlockedCount = userProgress.filter((p) => p.unlocked_at).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl text-primary flex items-center justify-center gap-3">
          <Trophy className="size-7" />
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="font-heading mb-4 text-lg text-primary">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={progressMap.get(achievement.id) ?? null}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, Trophy, Zap, BookOpen, CalendarDays } from "lucide-react";
import { CharacterHeader } from "@/components/dashboard/character-header";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { ActivityCalendar } from "@/components/dashboard/activity-calendar";
import { getTitle } from "@/lib/game/xp";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/animations";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, xpRes, skillsRes, streaksRes, achievementsRes, progressRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_xp").select("*").eq("user_id", user.id).single(),
    supabase.from("user_skills").select("*").eq("user_id", user.id).single(),
    supabase.from("user_streaks").select("*").eq("user_id", user.id).single(),
    supabase
      .from("user_achievements")
      .select("unlocked_at, achievements(*)")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_progress")
      .select("completed_at, stage_id")
      .eq("user_id", user.id)
      .gte("completed_at", new Date(Date.now() - 365 * 86400000).toISOString()),
  ]);

  const profile = profileRes.data;
  const xp = xpRes.data;
  const skills = skillsRes.data;
  const streak = streaksRes.data;
  const achievements = (achievementsRes.data ?? []) as unknown as {
    unlocked_at: string;
    achievements: { title: string; description: string | null; icon: string | null };
  }[];
  const progressEntries = progressRes.data ?? [];

  const activityData: Record<string, number> = {};
  for (const entry of progressEntries) {
    const day = new Date(entry.completed_at).toISOString().split("T")[0];
    activityData[day] = (activityData[day] ?? 0) + 1;
  }

  const totalLessons = new Set(progressEntries.map((e) => e.stage_id)).size;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <StaggerContainer>
        <StaggerItem>
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
        </StaggerItem>

        <StaggerItem>
          <FadeIn direction="up" delay={0.1}>
            <div className="rpg-card-border">
              <div className="rounded-xl bg-card p-4">
                <h3 className="font-heading mb-4 text-lg text-primary">
                  Stats Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-center">
                    <Zap className="mx-auto size-5 text-amber-400" />
                    <p className="text-2xl font-bold text-foreground">
                      {xp?.total_xp?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-center">
                    <BookOpen className="mx-auto size-5 text-blue-400" />
                    <p className="text-2xl font-bold text-foreground">
                      {totalLessons}
                    </p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-center">
                    <Flame className="mx-auto size-5 text-orange-400" />
                    <p className="text-2xl font-bold text-foreground">
                      {streak?.current_streak ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-center">
                    <Trophy className="mx-auto size-5 text-amber-400" />
                    <p className="text-2xl font-bold text-foreground">
                      {achievements.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </StaggerItem>

        <StaggerItem>
          <FadeIn direction="up" delay={0.2}>
            <StatsPanel skills={skills} />
          </FadeIn>
        </StaggerItem>

        <StaggerItem>
          <FadeIn direction="up" delay={0.3}>
            <div className="rpg-card-border">
              <div className="rounded-xl bg-card p-4">
                <h3 className="font-heading mb-4 flex items-center gap-2 text-lg text-primary">
                  <CalendarDays className="size-5" />
                  Activity
                </h3>
                <ActivityCalendar data={activityData} />
              </div>
            </div>
          </FadeIn>
        </StaggerItem>

        {achievements.length > 0 && (
          <StaggerItem>
            <FadeIn direction="up" delay={0.4}>
              <div className="rpg-card-border">
                <div className="rounded-xl bg-card p-4">
                  <h3 className="font-heading mb-4 flex items-center gap-2 text-lg text-primary">
                    <Trophy className="size-5 text-amber-400" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {achievements.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <Trophy className="size-5 shrink-0 text-amber-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{a.achievements.title}</p>
                          {a.achievements.description && (
                            <p className="text-xs text-muted-foreground">
                              {a.achievements.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.unlocked_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </StaggerItem>
        )}
      </StaggerContainer>
    </div>
  );
}

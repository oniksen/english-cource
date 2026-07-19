import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorldMap, type LevelData } from "@/components/map/world-map";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [levelsRes, sublevelsRes, modulesRes, lessonsRes, stagesRes, progressRes] =
    await Promise.all([
      supabase
        .from("cefr_levels")
        .select("id, code, title, order_index")
        .eq("is_active", true)
        .order("order_index"),
      supabase.from("sublevels").select("id, cefr_level_id"),
      supabase.from("modules").select("id, sublevel_id"),
      supabase.from("lessons").select("id, module_id"),
      supabase.from("lesson_stages").select("id, lesson_id"),
      supabase
        .from("user_progress")
        .select("stage_id")
        .eq("user_id", user.id),
    ]);

  const levels = levelsRes.data ?? [];
  const sublevels = sublevelsRes.data ?? [];
  const modules = modulesRes.data ?? [];
  const lessons = lessonsRes.data ?? [];
  const stages = stagesRes.data ?? [];
  const progress = progressRes.data ?? [];

  const moduleSublevelMap = new Map(modules.map((m) => [m.id, m.sublevel_id]));
  const lessonModuleMap = new Map(lessons.map((l) => [l.id, l.module_id]));
  const sublevelLevelMap = new Map(sublevels.map((s) => [s.id, s.cefr_level_id]));
  const completedIds = new Set(progress.map((p) => p.stage_id));

  const stageCounts = new Map<string, { total: number; completed: number }>();

  for (const stage of stages) {
    const moduleId = lessonModuleMap.get(stage.lesson_id);
    if (!moduleId) continue;
    const sublevelId = moduleSublevelMap.get(moduleId);
    if (!sublevelId) continue;
    const levelId = sublevelLevelMap.get(sublevelId);
    if (!levelId) continue;

    const entry = stageCounts.get(levelId) ?? { total: 0, completed: 0 };
    entry.total++;
    if (completedIds.has(stage.id)) entry.completed++;
    stageCounts.set(levelId, entry);
  }

  const levelData: LevelData[] = levels.map((level, i) => {
    const counts = stageCounts.get(level.id);
    const pct =
      counts && counts.total > 0
        ? Math.round((counts.completed / counts.total) * 100)
        : 0;

    let locked = false;
    if (i > 0) {
      const prevLevel = levels[i - 1];
      const prevCounts = stageCounts.get(prevLevel.id);
      locked = !prevCounts || prevCounts.completed === 0;
    }

    return {
      code: level.code,
      title: level.title,
      progress: pct,
      locked,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl text-primary">World Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore the regions of English mastery
        </p>
      </div>
      <WorldMap levels={levelData} />
    </div>
  );
}

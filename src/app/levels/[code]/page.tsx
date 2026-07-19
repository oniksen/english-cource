import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function LevelPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: level } = await supabase
    .from("cefr_levels")
    .select("*")
    .ilike("code", code)
    .single();

  if (!level || !level.is_active) notFound();

  const { data: sublevels } = await supabase
    .from("sublevels")
    .select("id, title, code, order_index")
    .eq("cefr_level_id", level.id)
    .eq("is_active", true)
    .order("order_index");

  const sublevelIds = sublevels?.map((s) => s.id) ?? [];

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .in("sublevel_id", sublevelIds)
    .eq("is_active", true)
    .order("order_index");

  const difficultyLabel = ["Easy", "Normal", "Hard", "Expert", "Master"];

  const moduleSublevelMap = new Map(sublevels?.map((s) => [s.id, s]));

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link
        href="/map"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to World Map
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl text-primary">{level.title}</h1>
        <p className="mt-1 text-muted-foreground">{level.description}</p>
        {sublevels && sublevels.length > 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {sublevels.length} sub-levels · {modules?.length ?? 0} modules
          </p>
        )}
      </div>

      {(!modules || modules.length === 0) && (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No modules available yet.</p>
        </div>
      )}

      {modules && modules.length > 0 && (
        <div className="space-y-4">
          {modules.map((mod) => {
            const sublevel = moduleSublevelMap.get(mod.sublevel_id ?? "");
            return (
              <Link
                key={mod.id}
                href={`/modules/${mod.id}`}
                className="group block"
              >
                <div className="rpg-card-border rounded-xl transition-all duration-200 group-hover:-translate-y-0.5">
                  <div className="rounded-xl bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mod.icon ?? "🏰"}</span>
                        <div>
                          <h2 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors">
                            {mod.title}
                          </h2>
                          {sublevel && (
                            <p className="text-xs text-muted-foreground">
                              {sublevel.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          {difficultyLabel[mod.difficulty ?? 1] ?? "Normal"}
                        </Badge>
                      </div>
                    </div>
                    {mod.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {mod.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      {mod.xp_reward != null && mod.xp_reward > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Zap className="size-3" />
                          {mod.xp_reward} XP
                        </span>
                      )}
                      {mod.estimated_minutes != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {mod.estimated_minutes} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

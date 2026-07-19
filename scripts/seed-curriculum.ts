import * as fs from "node:fs";
import * as path from "node:path";
import { load } from "js-yaml";
import { createSeedClient } from "../src/lib/supabase/seed-client";

type YamlLevel = {
  code: string;
  title: string;
  description?: string;
  order: number;
  is_active: boolean;
  sublevels: YamlSublevel[];
};

type YamlSublevel = {
  code: string;
  title: string;
  description?: string;
  order: number;
  is_active: boolean;
  modules: YamlModule[];
};

type YamlModule = {
  title: string;
  description?: string;
  order: number;
  difficulty: number;
  estimated_minutes?: number;
  xp_reward: number;
  is_active: boolean;
  lessons: YamlLesson[];
};

type YamlLesson = {
  title: string;
  order: number;
  xp_reward: number;
  is_active: boolean;
  stages: YamlStage[];
};

type YamlStage = {
  type: string;
  title: string;
  order: number;
  is_active: boolean;
  content: Record<string, unknown>;
};

type YamlVocabItem = {
  word: string;
  translation: string;
  example?: string;
};

async function main() {
  const yamlPath = path.resolve(
    __dirname,
    "..",
    "src",
    "data",
    "curriculum.yaml",
  );
  const raw = load(fs.readFileSync(yamlPath, "utf-8")) as {
    curriculum: YamlLevel[];
  };

  const data = raw.curriculum;
  const supabase = createSeedClient();

  console.log(`Found ${data.length} CEFR levels in YAML`);

  for (const level of data) {
    const { data: levelRow, error: levelErr } = await supabase
      .from("cefr_levels")
      .upsert(
        {
          code: level.code,
          title: level.title,
          description: level.description ?? null,
          order_index: level.order,
          is_active: level.is_active,
        },
        { onConflict: "code" },
      )
      .select("id")
      .single();

    if (levelErr) {
      console.error(`  Error upserting level ${level.code}:`, levelErr);
      continue;
    }
    console.log(`  Level "${level.code}" — id: ${levelRow!.id}`);

    for (const sub of level.sublevels) {
      const { data: subRow, error: subErr } = await supabase
        .from("sublevels")
        .upsert(
          {
            cefr_level_id: levelRow!.id,
            code: sub.code,
            title: sub.title,
            description: sub.description ?? null,
            order_index: sub.order,
            is_active: sub.is_active,
          },
          { onConflict: "code" },
        )
        .select("id")
        .single();

      if (subErr) {
        console.error(`    Error upserting sublevel ${sub.code}:`, subErr);
        continue;
      }
      console.log(`    Sublevel "${sub.code}" — id: ${subRow!.id}`);

      for (const mod of sub.modules) {
        const { data: modRow, error: modErr } = await supabase
          .from("modules")
          .insert({
            sublevel_id: subRow!.id,
            title: mod.title,
            description: mod.description ?? null,
            order_index: mod.order,
            difficulty: mod.difficulty,
            estimated_minutes: mod.estimated_minutes ?? null,
            xp_reward: mod.xp_reward,
            is_active: mod.is_active,
          })
          .select("id")
          .single();

        if (modErr) {
          console.error(`      Error inserting module "${mod.title}":`, modErr);
          continue;
        }
        console.log(`      Module "${mod.title}" — id: ${modRow!.id}`);

        for (const les of mod.lessons) {
          const { data: lesRow, error: lesErr } = await supabase
            .from("lessons")
            .insert({
              module_id: modRow!.id,
              title: les.title,
              order_index: les.order,
              xp_reward: les.xp_reward,
              is_active: les.is_active,
            })
            .select("id")
            .single();

          if (lesErr) {
            console.error(
              `        Error inserting lesson "${les.title}":`,
              lesErr,
            );
            continue;
          }
          console.log(`        Lesson "${les.title}" — id: ${lesRow!.id}`);

          for (const stg of les.stages) {
            const { data: stgRow, error: stgErr } = await supabase
              .from("lesson_stages")
              .insert({
                lesson_id: lesRow!.id,
                type: stg.type,
                title: stg.title,
                order_index: stg.order,
                content: stg.content,
                is_active: stg.is_active,
              })
              .select("id")
              .single();

            if (stgErr) {
              console.error(
                `          Error inserting stage "${stg.title}":`,
                stgErr,
              );
              continue;
            }

            if (stg.type === "vocabulary" && stg.content.words) {
              const words = stg.content.words as YamlVocabItem[];
              const vocabRows = words.map((w) => ({
                lesson_id: lesRow!.id,
                word: w.word,
                translation: w.translation,
                example_sentence: w.example ?? null,
              }));

              const { error: vocabErr } = await supabase
                .from("vocabulary_items")
                .insert(vocabRows);

              if (vocabErr) {
                console.error(
                  `            Error inserting vocabulary for stage "${stg.title}":`,
                  vocabErr,
                );
              } else {
                console.log(
                  `            Stage "${stg.title}" — ${words.length} vocabulary items`,
                );
              }
            } else {
              console.log(`            Stage "${stg.title}" — no vocabulary`);
            }
          }
        }
      }
    }
  }

  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

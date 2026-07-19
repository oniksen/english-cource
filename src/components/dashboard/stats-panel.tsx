"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  MessageCircle,
  Headphones,
  Book,
  Mic,
  PenTool,
  Languages,
} from "lucide-react";
import { SkillStat } from "@/components/game/skill-stat";

interface SkillsMap {
  grammar?: number | null;
  vocabulary?: number | null;
  listening?: number | null;
  reading?: number | null;
  speaking?: number | null;
  writing?: number | null;
  pronunciation?: number | null;
}

interface StatsPanelProps {
  skills: SkillsMap | null;
}

const skillsConfig = [
  { key: "grammar", label: "Grammar", icon: BookOpen },
  { key: "vocabulary", label: "Vocabulary", icon: Languages },
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "reading", label: "Reading", icon: Book },
  { key: "speaking", label: "Speaking", icon: MessageCircle },
  { key: "writing", label: "Writing", icon: PenTool },
  { key: "pronunciation", label: "Pronunciation", icon: Mic },
] as const;

export function StatsPanel({ skills }: StatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rpg-card-border"
    >
      <div className="rounded-xl bg-card p-4">
        <h3 className="font-heading mb-4 text-lg text-primary">
          Your Skills
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {skillsConfig.map(({ key, label, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <SkillStat
                name={label}
                value={(skills?.[key as keyof SkillsMap] as number) ?? 0}
                icon={<Icon className="size-4" />}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

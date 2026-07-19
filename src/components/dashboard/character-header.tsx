"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XpBar } from "@/components/game/xp-bar";
import { getTitle } from "@/lib/game/xp";

interface CharacterHeaderProps {
  profile: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    title?: string | null;
  };
  xp: {
    total_xp: number;
    level: number;
    xp_to_next_level: number;
  };
  streak: {
    current_streak: number;
  };
}

export function CharacterHeader({ profile, xp, streak }: CharacterHeaderProps) {
  const title = getTitle(xp.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rpg-card-border"
    >
      <div className="flex items-center gap-4 rounded-xl bg-card p-4">
        <Avatar size="lg">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>
            {(profile.display_name || profile.username)?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg">
              {profile.display_name || profile.username}
            </h2>
            <Badge
              variant="outline"
              className="border-primary text-primary"
            >
              Lvl {xp.level}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {title}
            </Badge>
          </div>

          <XpBar
            current={xp.total_xp}
            max={xp.xp_to_next_level}
            variant="xp"
          />
        </div>

        {streak.current_streak > 0 && (
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="size-5" />
            <span className="font-heading text-lg tabular-nums">
              {streak.current_streak}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

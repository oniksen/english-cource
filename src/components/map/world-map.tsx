"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RegionNode } from "./region-node";

export interface LevelData {
  code: string;
  title: string;
  progress: number;
  locked: boolean;
}

interface WorldMapProps {
  levels: LevelData[];
}

const NODES: Record<string, { x: number; y: number }> = {
  A1: { x: 200, y: 80 },
  A2: { x: 500, y: 80 },
  B1: { x: 200, y: 260 },
  B2: { x: 500, y: 260 },
  C1: { x: 200, y: 440 },
  C2: { x: 500, y: 440 },
};

const CONNECTIONS: [string, string][] = [
  ["A1", "A2"],
  ["A1", "B1"],
  ["A2", "B2"],
  ["B1", "B2"],
  ["B1", "C1"],
  ["B2", "C2"],
  ["C1", "C2"],
];

const SVG_W = 700;
const SVG_H = 520;

export function WorldMap({ levels }: WorldMapProps) {
  const levelMap = useMemo(
    () => Object.fromEntries(levels.map((l) => [l.code, l])),
    [levels],
  );

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="line-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.7 0.14 85)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="oklch(0.7 0.14 85)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.7 0.14 85)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {CONNECTIONS.map(([from, to], i) => {
          const fromPos = NODES[from];
          const toPos = NODES[to];
          const fromData = levelMap[from];
          const toData = levelMap[to];
          const bothUnlocked = fromData && toData && !fromData.locked && !toData.locked;

          return (
            <motion.line
              key={`conn-${from}-${to}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={bothUnlocked ? "url(#line-glow)" : "oklch(0.2 0.015 265)"}
              strokeWidth={bothUnlocked ? 2.5 : 1.5}
              strokeDasharray={bothUnlocked ? "none" : "6 4"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      <div className="relative" style={{ height: SVG_H }}>
        {levels.map((level, i) => {
          const pos = NODES[level.code];
          if (!pos) return null;

          return (
            <motion.div
              key={level.code}
              className="absolute"
              style={{ left: pos.x - 40, top: pos.y - 40 }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: "backOut" }}
            >
              <RegionNode
                code={level.code}
                title={level.title}
                progress={level.progress}
                locked={level.locked}
                highlighted={
                  !level.locked &&
                  level.progress < 100 &&
                  (i === 0 || levelMap[levels[i - 1]?.code]?.progress >= 100)
                }
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

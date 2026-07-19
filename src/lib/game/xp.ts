export function xpToNextLevel(level: number): number {
  if (level >= 100) return 0;
  const base = [100, 120, 150, 200, 250, 300, 400, 500, 600, 800];
  const tier = Math.min(Math.floor((level - 1) / 10), base.length - 1);
  return level * base[tier];
}

export function getTitle(level: number): string {
  if (level >= 100) return "Native-like";
  const tiers: [number, string][] = [
    [1, "Novice"],
    [10, "Explorer"],
    [20, "Scholar"],
    [30, "Linguist"],
    [40, "Communicator"],
    [50, "Fluent"],
    [60, "Master"],
    [70, "Elite"],
    [80, "Professor"],
    [90, "Legend"],
  ];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (level >= tiers[i][0]) return tiers[i][1];
  }
  return "Novice";
}

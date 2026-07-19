"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function FadeIn({ children, delay = 0, direction = "up" }: { children: ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right" }) {
  const dirMap = { up: { y: 20 }, down: { y: -20 }, left: { x: 20 }, right: { x: -20 } };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, staggerDelay = 0.08 }: { children: ReactNode; staggerDelay?: number }) {
  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ from = 0, to, duration = 1 }: { from?: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);
  useEffect(() => {
    if (from === to) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(from + (to - from) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export function LevelUpOverlay({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.6, repeat: 3 }}
        >
          <Sparkles className="mx-auto size-12 text-amber-400" />
        </motion.div>
        <h2 className="font-heading text-4xl text-amber-400 rpg-level-up-glow">
          Level Up!
        </h2>
        <p className="text-2xl text-primary font-heading">Level {level}</p>
        <p className="text-sm text-muted-foreground">Click anywhere to continue</p>
      </motion.div>
    </motion.div>
  );
}

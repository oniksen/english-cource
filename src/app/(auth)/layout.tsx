import type { Metadata } from "next";
import { Sword, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "English Quest - Auth",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <Sword className="size-8 text-primary" />
          <h1 className="font-heading text-3xl tracking-wide text-primary">
            English Quest
          </h1>
          <Sparkles className="size-6 text-accent" />
        </div>

        <div className="rpg-card-border w-full">
          <div className="rounded-xl bg-card p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

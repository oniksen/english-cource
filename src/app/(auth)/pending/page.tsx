import { Hourglass } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="rpg-glow-accent flex size-16 items-center justify-center rounded-full bg-muted">
        <Hourglass className="size-8 text-accent" />
      </div>

      <h1 className="font-heading text-2xl tracking-wide text-primary">
        Your Quest Awaits
      </h1>

      <p className="text-muted-foreground">
        Your account is pending approval from the Guild Masters.
      </p>

      <p className="text-xs text-muted-foreground/60">
        You&apos;ll receive access once approved.
      </p>
    </div>
  );
}

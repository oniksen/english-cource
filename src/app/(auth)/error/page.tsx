import { ShieldOff } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="rpg-glow-destructive flex size-16 items-center justify-center rounded-full bg-muted">
        <ShieldOff className="size-8 text-destructive" />
      </div>

      <h1 className="font-heading text-2xl tracking-wide text-destructive">
        Access Denied
      </h1>

      <p className="text-muted-foreground">
        Your registration could not be approved.
      </p>

      <p className="text-xs text-muted-foreground/60">
        Please contact the Guild Masters for support.
      </p>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (role?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 flex-col gap-6 border-r border-border/50 bg-card p-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-heading text-lg tracking-wide text-primary"
        >
          <ShieldCheck className="size-5" />
          Guild Admin
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/admin/approvals"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Users className="size-4" />
            Approvals
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

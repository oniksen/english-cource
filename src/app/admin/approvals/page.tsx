import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ApproveRejectActions } from "./actions";

async function getPendingApprovals() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_approvals")
    .select("user_id, requested_at, status, user_profiles!inner(username, display_name)")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  return (data ?? []) as unknown as Array<{
    user_id: string;
    requested_at: string | null;
    status: string;
    user_profiles: { username: string; display_name: string | null };
  }>;
}

export default async function ApprovalsPage() {
  const approvals = await getPendingApprovals();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl tracking-wide text-primary">
          Pending Approvals
        </h1>
        <p className="text-sm text-muted-foreground">
          Review adventurer applications
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="rpg-card-border">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-12 text-center">
            <p className="font-heading text-lg text-muted-foreground">
              No pending approvals
            </p>
            <p className="text-sm text-muted-foreground/60">
              All adventurers have been reviewed.
            </p>
          </div>
        </div>
      ) : (
        <div className="rpg-card-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Adventurer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Requested
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {approvals.map((approval) => (
                <tr key={approval.user_id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {approval.user_profiles?.display_name ??
                          approval.user_profiles?.username}
                      </span>
                      {approval.user_profiles?.display_name && (
                        <span className="text-xs text-muted-foreground">
                          {approval.user_profiles.username}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {approval.requested_at
                      ? new Date(approval.requested_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-yellow-600/50 text-yellow-500">
                      Pending
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ApproveRejectActions userId={approval.user_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (role?.role !== "admin") throw new Error("Not authorized");
}

export async function approveUser(userId: string) {
  const supabase = await createClient();
  await assertAdmin(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("user_approvals")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
    })
    .eq("user_id", userId);

  revalidatePath("/admin/approvals");
}

export async function rejectUser(userId: string, reason: string) {
  const supabase = await createClient();
  await assertAdmin(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("user_approvals")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
      reject_reason: reason,
    })
    .eq("user_id", userId);

  revalidatePath("/admin/approvals");
}

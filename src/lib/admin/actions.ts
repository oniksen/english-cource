"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveUser(userId: string) {
  const supabase = await createClient();
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

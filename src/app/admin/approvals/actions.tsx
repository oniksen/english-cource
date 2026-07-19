"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveUser, rejectUser } from "@/lib/admin/actions";

export function ApproveRejectActions({ userId }: { userId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    setPending(true);
    await approveUser(userId);
    setPending(false);
  }

  async function handleReject() {
    setPending(true);
    await rejectUser(userId, reason);
    setPending(false);
    setRejecting(false);
    setReason("");
  }

  if (rejecting) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-7 w-40 text-xs"
        />
        <Button
          size="xs"
          variant="destructive"
          disabled={!reason || pending}
          onClick={handleReject}
        >
          Confirm
        </Button>
        <Button
          size="xs"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setRejecting(false);
            setReason("");
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="xs"
        variant="outline"
        className="border-green-600/50 text-green-500 hover:bg-green-500/10"
        disabled={pending}
        onClick={handleApprove}
      >
        <Check className="size-3" />
        Approve
      </Button>
      <Button
        size="xs"
        variant="destructive"
        disabled={pending}
        onClick={() => setRejecting(true)}
      >
        <X className="size-3" />
        Reject
      </Button>
    </div>
  );
}

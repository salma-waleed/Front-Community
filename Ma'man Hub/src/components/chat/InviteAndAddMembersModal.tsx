// src/components/chat/InviteAndAddMembersModal.tsx
import { useState, useEffect } from "react";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  chatApi,
  type InviteLinkDto,
  type AddMemberByEmailResponse,
} from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function InviteAndAddMembersModal({
  groupId,
  open,
  onClose,
  canInvite,
  canAdd,
}: {
  groupId: string;
  open: boolean;
  onClose: () => void;
  canInvite: boolean;
  canAdd: boolean;
}) {
  const [invite, setInvite] = useState<InviteLinkDto | null>(null);
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<AddMemberByEmailResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !canInvite || !groupId) return;
    chatApi.getInviteLink(groupId).then(setInvite).catch(() => {});
  }, [open, groupId, canInvite]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setResult(null);
    }
  }, [open]);

  const copyLink = () => {
    if (!invite) return;
    navigator.clipboard.writeText(invite.url);
    toast({ title: "Invite link copied" });
  };

  const regenerate = async () => {
    try {
      const fresh = await chatApi.regenerateInviteLink(groupId);
      setInvite(fresh);
      toast({ title: "New invite link generated" });
    } catch {
      toast({ title: "Couldn't generate a new link", variant: "destructive" });
    }
  };

  const addByEmail = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const res = await chatApi.addMemberByEmail(groupId, email.trim());
      setResult(res);
      if (res.added) {
        toast({ title: "Member added" });
        setEmail("");
      }
    } catch {
      toast({ title: "Couldn't add member", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {canAdd && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Add by email
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addByEmail()}
                />
                <Button onClick={addByEmail} disabled={!email.trim() || searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>

              {result && (
                <div
                  className={cn(
                    "mt-2 text-sm p-3 rounded-lg border",
                    result.added
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                      : result.userFound
                      ? "bg-muted border-border"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700"
                  )}
                >
                  <p>{result.message}</p>
                  {result.inviteShareUrl && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input readOnly value={result.inviteShareUrl} className="h-8 text-xs" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(result.inviteShareUrl!);
                          toast({ title: "Link copied — share it with them" });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {canInvite && invite && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Or share invite link
              </label>
              <div className="flex items-center gap-2">
                <Input readOnly value={invite.url} className="text-xs" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <button
                onClick={regenerate}
                className="text-xs text-muted-foreground hover:text-foreground underline mt-1.5"
              >
                Generate new link (invalidates the old one)
              </button>
            </div>
          )}

          {!canAdd && !canInvite && (
            <p className="text-sm text-muted-foreground text-center py-4">
              You don't have permission to add members to this group.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
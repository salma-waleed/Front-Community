// src/components/chat/GroupSettingsModal.tsx
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { chatApi, type GroupSettingsDto } from "@/services/chatService";
import { useChatStore } from "@/stores/chatStore";
import { useToast } from "@/hooks/use-toast";

export function GroupSettingsModal({
  groupId,
  open,
  onClose,
}: {
  groupId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<GroupSettingsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const updateGroupSettings = useChatStore((s) => s.updateGroupSettings);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !groupId) return;
    setLoading(true);
    chatApi
      .getGroupSettings(groupId)
      .then(setSettings)
      .catch(() =>
        toast({ title: "Couldn't load settings", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [open, groupId]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await chatApi.updateGroupSettings(groupId, settings);
      updateGroupSettings(groupId, {
        name: updated.name,
        description: updated.description,
        avatarUrl: updated.avatarUrl,
      });
      toast({ title: "Settings saved" });
      onClose();
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Group settings</DialogTitle>
        </DialogHeader>

        {loading || !settings ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Group name
              </label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Description
              </label>
              <Input
                value={settings.description ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Who can invite people
              </label>
              <select
                className="w-full border rounded-lg h-9 px-2 text-sm bg-background"
                value={settings.whoCanInvite}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whoCanInvite: e.target.value as GroupSettingsDto["whoCanInvite"],
                  })
                }
              >
                <option value="owner">Owner only</option>
                <option value="admins">Owner &amp; admins</option>
                <option value="all">All members</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Who can add members
              </label>
              <select
                className="w-full border rounded-lg h-9 px-2 text-sm bg-background"
                value={settings.whoCanAddMembers}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whoCanAddMembers: e.target.value as GroupSettingsDto["whoCanAddMembers"],
                  })
                }
              >
                <option value="owner">Owner only</option>
                <option value="admins">Owner &amp; admins</option>
                <option value="all">All members</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show old chat history to new members</label>
              <input
                type="checkbox"
                checked={settings.showOldChatToNewMembers}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showOldChatToNewMembers: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Invite link enabled</label>
              <input
                type="checkbox"
                checked={settings.inviteLinkEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, inviteLinkEnabled: e.target.checked })
                }
                className="h-4 w-4"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
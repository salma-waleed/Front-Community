// src/pages/JoinGroupPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { chatApi, type GroupPreviewDto } from "@/services/chatService";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addGroupLocal, setActive } = useChatStore();
  const { toast } = useToast();

  const [preview, setPreview] = useState<GroupPreviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    if (!token) {
      // Not logged in — bounce to login, then come back to this invite
      navigate(`/login?redirect=/join/${code}`);
      return;
    }

    chatApi
      .previewInvite(code)
      .then(setPreview)
      .catch(() => setError("This invite link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [code, token]);

  const handleJoin = async () => {
    if (!code) return;
    setJoining(true);
    try {
      const group = await chatApi.joinByInvite(code);
      addGroupLocal(group);
      toast({ title: `Joined ${group.name}` });
      await setActive("group", group.id);
      navigate("/groups");
    } catch {
      toast({ title: "Couldn't join the group", variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="font-medium">Invite not found</p>
            <p className="text-sm text-muted-foreground">
              {error ?? "This invite link is invalid or has expired."}
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {preview.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-lg">{preview.name}</h1>
            {preview.description && (
              <p className="text-sm text-muted-foreground mt-1">{preview.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <Users className="h-3.5 w-3.5" /> {preview.membersCount} members
            </p>
          </div>
          <Button className="w-full" onClick={handleJoin} disabled={joining}>
            {joining ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Join group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
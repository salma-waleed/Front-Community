import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { feedApi } from "../../services/feedService.ts";

interface Props {
  userId: string;
  initialFollowing: boolean;
  onToggle?: (isFollowing: boolean, followersCount: number) => void;
  size?: "sm" | "default";
  variant?: "default" | "outline";
}

export function FollowButton({
  userId,
  initialFollowing,
  onToggle,
  size = "sm",
  variant = "outline",
}: Props) {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!user || user.id === userId) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger parent nav
    setLoading(true);
    try {
      const res = await feedApi.toggleFollow(userId);
      setIsFollowing(res.isFollowing);
      onToggle?.(res.isFollowing, res.followersCount);
      toast({
        title: res.isFollowing ? "Following!" : "Unfollowed",
      });
    } catch {
      toast({ title: "Failed to update follow", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? "secondary" : variant}
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5 shrink-0"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
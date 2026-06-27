// src/components/chat/EditPreview.tsx

import { motion } from "framer-motion";
import { Edit2, X } from "lucide-react";
import type { ChatMessageDto } from "@/services/chatService";

interface EditPreviewProps {
  msg: ChatMessageDto;
  onCancel: () => void;
}

export function EditPreview({ msg, onCancel }: EditPreviewProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2 border-t bg-amber-500/10 text-sm overflow-hidden"
    >
      <Edit2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-amber-600 dark:text-amber-400 text-xs">
          Editing message
        </span>
        <p className="text-muted-foreground truncate">
          {msg.isDeleted ? "Deleted message" : msg.content}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-muted rounded-full shrink-0"
        title="Cancel edit (Esc)"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
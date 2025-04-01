"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/chat-store";
import { format } from "date-fns";

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  selectedChat,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const { chats, deleteChat } = useChatStore();

  // Sort chats by updatedAt (newest first)
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <PlusIcon className="h-4 w-4" />
          新对话
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sortedChats.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              没有聊天记录
            </div>
          ) : (
            sortedChats.map((chat) => (
              <div key={chat.id} className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left p-3 h-auto",
                    selectedChat === chat.id ? "bg-muted" : ""
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquareIcon className="h-4 w-4 mt-1 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(chat.updatedAt), "yyyy-MM-dd")}
                      </div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

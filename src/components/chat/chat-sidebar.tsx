"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

type ChatHistoryItem = {
  id: string;
  title: string;
  date: Date;
};

// Demo chat history
const demoChats: ChatHistoryItem[] = [
  {
    id: "chat-1",
    title: "UCASS policies and guidelines",
    date: new Date(2023, 9, 15),
  },
  {
    id: "chat-2",
    title: "Student registration process",
    date: new Date(2023, 9, 18),
  },
  {
    id: "chat-3",
    title: "Campus resources and facilities",
    date: new Date(2023, 9, 20),
  },
];

export default function ChatSidebar({
  selectedChat,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <PlusIcon className="h-4 w-4" />
          New chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {demoChats.map((chat) => (
            <Button
              key={chat.id}
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
                    {chat.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

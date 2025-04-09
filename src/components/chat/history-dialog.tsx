"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { History, Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { format } from "date-fns";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export function HistoryDialog() {
  const { chats, setCurrentChatId, deleteChat } = useChatStore();
  const [open, setOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const router = useRouter();

  // Sort chats by updatedAt (newest first)
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleSelectChat = (id: string, conversationId?: string) => {
    setCurrentChatId(id);
    setOpen(false);

    // Navigate to the chat URL if conversation ID exists
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    }
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="历史记录">
            <History className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>历史对话</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {sortedChats.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                没有聊天记录
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {sortedChats.map((chat) => {
                    // Get the first user message as preview
                    const previewMessage = chat.messages.find(
                      (m) => m.role === "user"
                    );
                    const preview = previewMessage?.content || "无内容";

                    // Get conversation length info
                    const messageCount = chat.messages.length;
                    const lastUpdated = format(
                      new Date(chat.updatedAt),
                      "yyyy-MM-dd HH:mm"
                    );

                    return (
                      <div
                        key={chat.id}
                        className="relative group flex flex-col space-y-1 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => handleSelectChat(chat.id, chat.conversationId)}
                        >
                          <h4 className="font-medium">{chat.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {lastUpdated}
                          </span>
                        </div>
                        <p
                          className="text-sm text-muted-foreground line-clamp-2 cursor-pointer"
                          onClick={() => handleSelectChat(chat.id, chat.conversationId)}
                        >
                          {preview}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {messageCount} 条消息
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatToDelete(chat.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!chatToDelete}
        onOpenChange={(isOpen) => !isOpen && setChatToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个对话吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

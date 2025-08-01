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
      {/* --- 修改：为DialogContent增加更健壮的布局 --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="历史记录">
            <History className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        {/* 修改：使用flex布局，并限制了最大高度，让内部元素可以正确伸缩 */}
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>历史对话</DialogTitle>
          </DialogHeader>
          
          {/* 修改：让这个 div 成为可伸缩的主体，并处理 overflow */}
          <div className="flex-1 overflow-y-auto -mr-6 pr-6">
            {sortedChats.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                没有聊天记录
              </div>
            ) : (
                <div className="space-y-2">
                  {sortedChats.map((chat) => {
                    if (!chat || !Array.isArray(chat.messages)) {
                      return null; 
                    }

                    const previewMessage = chat.messages.find(
                      (m) => m && m.role === "user"
                    );
                    const preview = previewMessage?.content || "无内容";
                    const messageCount = chat.messages.length;
                    const lastUpdated = format(
                      new Date(chat.updatedAt),
                      "yyyy-MM-dd HH:mm"
                    );

                    return (
                      <div
                        key={chat.id}
                        className="group relative flex cursor-pointer flex-col rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => handleSelectChat(chat.id, chat.conversationId)}
                      >
                        <h4 className="min-w-0 flex-1 truncate font-semibold text-primary">
                          {chat.title}
                        </h4>
                        <p className="mt-1 flex-1 break-words text-sm text-muted-foreground line-clamp-2">
                          {preview}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {messageCount} 条消息 · {lastUpdated}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-1 opacity-0 transition-opacity group-hover:opacity-100"
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
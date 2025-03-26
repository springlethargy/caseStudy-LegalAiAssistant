"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";

// Demo chat history
const demoHistory = [
  {
    id: "history-1",
    title: "UCASS政策与指南",
    date: "2023-10-15",
    preview: "我需要了解学校的政策...",
  },
  {
    id: "history-2",
    title: "学生注册流程",
    date: "2023-10-18",
    preview: "如何注册新学期的课程？",
  },
  {
    id: "history-3",
    title: "校园资源与设施",
    date: "2023-10-20",
    preview: "图书馆开放时间是什么时候？",
  },
];

export function HistoryDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="历史记录">
          <History className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>历史对话</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            {demoHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col space-y-1 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

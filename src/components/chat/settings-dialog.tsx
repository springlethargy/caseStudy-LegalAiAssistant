"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="设置">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">主题</h4>
              <p className="text-sm text-muted-foreground">
                切换浅色和深色模式
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">自动保存对话</h4>
              <p className="text-sm text-muted-foreground">
                自动保存所有对话历史
              </p>
            </div>
            <Switch id="auto-save" defaultChecked />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

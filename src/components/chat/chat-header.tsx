import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Info } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HistoryDialog } from "@/components/chat/history-dialog";
import { SettingsDialog } from "@/components/chat/settings-dialog";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/chat-store";
import { v4 as uuidv4 } from "uuid";

interface ChatHeaderProps {
    onNewChat: () => void;
    onClearChat: () => void;
    isClearDisabled: boolean;
    metadata?: {
        totalTokens?: number;
        elapsedTime?: number;
    };
}

export function ChatHeader({
    onNewChat,
    onClearChat,
    isClearDisabled,
    metadata,
}: ChatHeaderProps) {
    const router = useRouter();
    const { addChat, updateChatMetadata } = useChatStore();
    const hasMetadata = metadata?.totalTokens || metadata?.elapsedTime;

    // Create a new chat with a new UUID and navigate to it
    const handleNewChat = () => {
        const newChatId = addChat();
        const conversationId = uuidv4();
        updateChatMetadata(newChatId, { conversationId });
        router.push(`/chat/${conversationId}`);
    };

    return (
        <header className="border-b p-4 flex items-center justify-between bg-background sticky top-0 z-10">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary">社问</h1>
            </div>
            <div className="flex items-center gap-2">
                {hasMetadata && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs">
                                    {metadata?.totalTokens && (
                                        <div>使用的令牌: {metadata.totalTokens}</div>
                                    )}
                                    {metadata?.elapsedTime && (
                                        <div>处理时间: {metadata.elapsedTime.toFixed(2)}s</div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    title="新对话"
                    className="flex items-center gap-1"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span>新对话</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            title="清空对话"
                            disabled={isClearDisabled}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认清空对话</AlertDialogTitle>
                            <AlertDialogDescription>
                                此操作将删除当前对话中的所有消息，但保留对话本身。此操作不可撤消。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={onClearChat}>
                                确认
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <HistoryDialog />
                <SettingsDialog />
                <ThemeToggle />
            </div>
        </header>
    );
}

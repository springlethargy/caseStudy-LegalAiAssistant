import { Message } from "@/app/page";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-4 mb-4 select-none">
            <Image className="hidden" draggable={false} width={400} height={450} src={'/ucass_logo.png'} alt="The ucass logo"/>
          </div>
          <h3 className="text-lg font-medium mb-1">欢迎使用社问</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            有任何关于社科大的问题，请在下方输入框中提问
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={cn("group relative")}>
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              <Avatar className={cn("h-8 w-8 mt-1")}>
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-full",
                    message.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "assistant" ? "U" : "我"}
                </div>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">
                  {message.role === "assistant" ? "社答" : "我"}
                </div>
                <div className="prose prose-sm dark:prose-invert">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="relative">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <Avatar className="h-8 w-8 mt-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                U
              </div>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">社答</div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

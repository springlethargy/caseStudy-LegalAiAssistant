import { Message } from "@/app/chat/page";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <h3 className="text-lg font-medium">Welcome to Ask UCASS</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by typing a message below
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 max-w-3xl",
              message.role === "user" ? "ml-auto" : ""
            )}
          >
            <Avatar
              className={cn(
                "h-8 w-8",
                message.role === "user" ? "order-2" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-full",
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" ? "AI" : "U"}
              </div>
            </Avatar>
            <div
              className={cn(
                "rounded-lg px-4 py-3",
                message.role === "assistant"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex items-start gap-3 max-w-3xl">
          <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
              AI
            </div>
          </Avatar>
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
    </div>
  );
}

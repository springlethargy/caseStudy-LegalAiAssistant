import { Message } from "@/lib/chat-store";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'
import { Progress } from "../ui/progress";
import { FeedbackForm } from "./feedback-form";
import Image from "next/image";
import { EmptyChat } from "./empty-chat";

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
        <EmptyChat />
      ) : (
        messages.map((message, index) => (
          <div key={message.id} className={cn("group relative")}>
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              <Avatar className={cn("h-8 w-8 mt-1", message.role === "assistant" ? "overflow-hidden" : "")}>
                {message.role === "assistant" ? (
                  <Image
                    src="/ask_logo.png"
                    alt="Assistant Avatar"
                    width={32}
                    height={32}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    我
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">
                  {message.role === "assistant" ? "社答" : "我"}
                </div>
                <article className="prose prose-slate prose-sm dark:prose-invert">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
            {/* Position the feedback form below the assistant message with proper alignment.
                The feedback form will appear with animation after the message loading is complete
                and with a small delay to ensure a smooth user experience. */}
            {message.role === "assistant" && (
              <div className="mt-2 max-w-3xl mx-auto pl-12">
                <FeedbackForm
                  message={message}
                  prevMessage={index > 0 ? messages[index - 1] : undefined}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        ))
      )}

      {isLoading && (
        <div className="relative">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <div className="flex-1">
              <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

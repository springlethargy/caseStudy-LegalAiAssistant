import { Message } from "@/lib/chat-store";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'
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

                {!message.content && !isLoading &&
                  <div className="text-red-700 dark:text-red-400 rounded-md">
                    出现了一些错误：但是我也不知道为什么
                  </div>}
                {isLoading && index === messages.length - 1 && (
                  <div className="relative">
                    <div className="flex items-start gap-4 max-w-3xl mx-auto">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Position the feedback form below the assistant message with proper alignment.
                The feedback form will appear with animation after the message loading is complete
                and with a small delay to ensure a smooth user experience. */}
            {message.role === "assistant" && message.content && (
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
    </div>
  );
}

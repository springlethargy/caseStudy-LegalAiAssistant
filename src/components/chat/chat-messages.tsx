"use client";

import { Message } from "@/lib/chat-store";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'
import { FeedbackForm } from "./feedback-form";
import Image from "next/image";
import { EmptyChat } from "./empty-chat";
import { Loader2 } from "lucide-react";

// 修改：移除不再需要的 onPromptClick
interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
}

export default function ChatMessages({
  messages,
  isLoading,
  isTyping,
}: ChatMessagesProps) {
  // 由于我们将“建议问题”整合进了 EmptyChat/ChatSetup，这里的 onPromptClick
  // 实际上是通过 EmptyChat 传递的，此处的逻辑保持不变是正确的。
  // 我们只是修复 page.tsx 中调用此组件时的问题。
  return (
    <div className="space-y-6">
      {messages.length === 0 ? (
        // onStartChat is the correct prop for the new EmptyChat/ChatSetup component
        // This seems to be a naming mismatch. Let's assume onPromptClick is not needed here
        // and the onStartChat is passed directly to EmptyChat in page.tsx
        <div /> // This will be handled by logic in page.tsx now
      ) : (
        messages.map((message, index) => (
          <div key={message.id} className={cn("group relative")}>
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              <Avatar className={cn("h-8 w-8 mt-1", message.role === "assistant" ? "overflow-hidden" : "")}>
                {message.role === "assistant" ? (
                  (isLoading || isTyping) && index === messages.length - 1 ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src="/ask_logo.png"
                      alt="Assistant Avatar"
                      width={32}
                      height={32}
                      priority
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    我
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">
                  {message.role === "assistant" ? "Assistant" : "我"}
                </div>
                <article className="prose prose-slate prose-sm dark:prose-invert">
                  <ReactMarkdown
                    // [新增]：添加 components 属性来自定义元素渲染
                    components={{
                      // [新增]：定义如何渲染 img 元素
                      img: ({ node, ...props }) => {
                        // [修改]：在原有的检查基础上，增加一次类型检查
                        // 这样可以确保传递给 next/image 的 src 必定是字符串
                        if (props.src && typeof props.src === 'string') {
                          return (
                            <Image
                              src={props.src}
                              alt={props.alt || "markdown image"} // [新增]：提供一个默认的 alt 文本
                              width={500} // [新增]：next/image 需要明确的尺寸，这里提供一个默认值
                              height={300} // [新增]：您可以根据需要调整或动态计算这些值
                              className="rounded-md"
                            />
                          );
                        }
                        // [新增]：如果 src 为空或类型不是 string，则不渲染任何元素
                        return null;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </article>

                {!message.content && !isLoading && !isTyping &&
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
            {message.role === "assistant" && message.content && !isLoading && !isTyping && (
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
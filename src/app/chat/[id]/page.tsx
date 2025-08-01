"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ChatInput from "@/components/chat/chat-input";
import { useChatStore } from "@/lib/chat-store";
import { useChat } from "@/hooks/useChatHandler";
import { ChatHeader } from "@/components/chat/chat-header";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChat } from "@/components/chat/empty-chat";

const ChatMessages = dynamic(() => import("@/components/chat/chat-messages"), {
    ssr: false,
    loading: () => (
      <div className="space-y-6 p-4">
          <div className="flex items-start gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-20 w-full" /></div>
          <div className="flex items-start gap-4 flex-row-reverse"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-12 w-4/5" /></div>
      </div>
    ),
});

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

    const {
        currentChatId,
        setCurrentChatId,
        addMessage,
        clearMessages,
		updateChatContext,
    } = useChatStore();

    const { handleSendMessage, isLoading, isTyping, streamMetadata } = useChat();

    useEffect(() => {
        const { chats, addChat, updateChatMetadata } = useChatStore.getState();
        const existingChat = chats.find(chat => chat.conversationId === conversationId);

        if (existingChat) {
            if (currentChatId !== existingChat.id) {
                setCurrentChatId(existingChat.id);
            }
        } else {
            const newChatId = addChat();
            updateChatMetadata(newChatId, { conversationId });
            setCurrentChatId(newChatId);
        }
    }, [conversationId, setCurrentChatId]);

    const currentChat = useChatStore((state) => 
        state.chats.find((c) => c.id === state.currentChatId)
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentChat?.messages]);

    const handleNewChat = () => {
        const newConversationId = uuidv4();
        router.push(`/chat/${newConversationId}`);
    };

    const handleClearChat = () => {
        if (currentChatId) {
            clearMessages(currentChatId);
        }
    };

    const showFeatureInProgressMessage = (userMessage: string) => {
        if (!currentChatId) return;
        addMessage(currentChatId, "user", userMessage);
        addMessage(currentChatId, "assistant", "抱歉，该功能正在全力开发中，敬请期待！");
    };

    const handleSendFromInput = (message: string) => {
        const questionType = currentChat?.questionType || "宪法";

        if (questionType !== "宪法") {
            showFeatureInProgressMessage(message);
        } else {
            handleSendMessage(message, currentChatId, questionType, "", "");
        }
    };

    const handleStartChat = (
		message: string,
		questionType: string,
		answer: string,
		answer_idea: string
    ) => {
        if(currentChatId) {
            updateChatContext(currentChatId, { questionType });
        }
        
        if (questionType !== "宪法") {
            showFeatureInProgressMessage(message);
        } else {
            handleSendMessage(message, currentChatId, questionType, answer, answer_idea);
        }
    };

    const isClearDisabled =
        !currentChatId || (currentChat?.messages?.length || 0) === 0;

    const isEmptyConversation = currentChat && currentChat.messages.length === 0;
    
    return (
        <div className="flex flex-col h-screen">
            <ChatHeader
                onNewChat={handleNewChat}
                onClearChat={handleClearChat}
                isClearDisabled={isClearDisabled}
                metadata={currentChat?.metadata}
            />
            <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
                {currentChat ? (
                    isEmptyConversation ? (
                        <EmptyChat onStartChat={handleStartChat} isLoading={isLoading || isTyping} />
                    ) : (
                        <>
                            {/* 修改：移除了不再需要的 onPromptClick 属性 */}
                            <ChatMessages
                                messages={currentChat.messages}
                                isLoading={isLoading}
                                isTyping={isTyping}
                            />
                            <div ref={messagesEndRef} />
                        </>
                    )
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">正在加载对话...</p>
                    </div>
                )}
            </div>
            {!isEmptyConversation && currentChat && (
                <div className="p-4 border-t bg-background sticky bottom-0 z-10">
                    <div className="max-w-4xl mx-auto w-full">
                        <ChatInput onNewChat={handleNewChat} />
                        {streamMetadata.totalTokens && (
                            <div className="text-xs text-muted-foreground mt-2 text-right">
                                Tokens: {streamMetadata.totalTokens} |
                                Time: {streamMetadata.elapsedTime?.toFixed(2)}s
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
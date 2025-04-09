"use client";

import { useEffect, useRef } from "react";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import { useChatStore } from "@/lib/chat-store";
import { useChat } from "@/hooks/useChatHandler";
import { ChatHeader } from "@/components/chat/chat-header";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.id as string;

    const {
        chats,
        currentChatId,
        setCurrentChatId,
        addChat,
        getCurrentChat,
        clearMessages,
        updateChatMetadata,
    } = useChatStore();

    const { handleSendMessage, isLoading, streamMetadata } = useChat();

    // Find or create a chat with this conversation ID
    useEffect(() => {
        // Try to find a chat with this conversation ID
        const existingChat = chats.find(chat => chat.conversationId === conversationId);

        if (existingChat) {
            // If found, set as current chat
            setCurrentChatId(existingChat.id);
        } else {
            // If not found, create a new chat with this conversation ID
            const newChatId = addChat();
            updateChatMetadata(newChatId, { conversationId });
            setCurrentChatId(newChatId);
        }
    }, [conversationId, chats, addChat, setCurrentChatId, updateChatMetadata]);

    const currentChat = getCurrentChat();
    const messages = currentChat?.messages || [];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle new chat
    const handleNewChat = () => {
        const newChatId = addChat();
        const conversationId = uuidv4();
        updateChatMetadata(newChatId, { conversationId });
        router.push(`/chat/${conversationId}`);
    };

    // Handle clear chat
    const handleClearChat = () => {
        if (currentChatId) {
            clearMessages(currentChatId);
        }
    };

    const isClearDisabled =
        !currentChatId || (currentChat?.messages.length || 0) === 0;

    return (
        <div className="flex flex-col h-screen">
            <ChatHeader
                onNewChat={handleNewChat}
                onClearChat={handleClearChat}
                isClearDisabled={isClearDisabled}
                metadata={currentChat?.metadata}
            />
            <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
                <ChatMessages messages={messages} isLoading={isLoading} />
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-background sticky bottom-0 z-10">
                <div className="max-w-4xl mx-auto w-full">
                    <ChatInput
                        onSendMessage={(message) =>
                            handleSendMessage(message, currentChatId)
                        }
                        isLoading={isLoading}
                    />
                    {streamMetadata.totalTokens && (
                        <div className="text-xs text-muted-foreground mt-2 text-right">
                            Tokens: {streamMetadata.totalTokens} |
                            Time: {streamMetadata.elapsedTime?.toFixed(2)}s
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
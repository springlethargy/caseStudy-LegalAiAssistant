"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { HistoryDialog } from "@/components/chat/history-dialog";
import { SettingsDialog } from "@/components/chat/settings-dialog";
import { useChatStore, Message as ChatMessage } from "@/lib/chat-store";
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

export default function Home() {
    const {
        chats,
        currentChatId,
        setCurrentChatId,
        addChat,
        addMessage,
        getCurrentChat,
        clearMessages,
        updateMessageContent,
    } = useChatStore();

    const currentChat = getCurrentChat();
    const messages = currentChat?.messages || [];
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Create a new chat if there's no current chat
    useEffect(() => {
        if (chats.length === 0) {
            addChat();
        } else if (!currentChatId && chats.length > 0) {
            setCurrentChatId(chats[0].id);
        }
    }, [chats, currentChatId, addChat, setCurrentChatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to handle user message submission
    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !currentChatId) return;

        // Add user message
        addMessage(currentChatId, "user", message);

        // Show loading state
        setIsLoading(true);

        try {
            // Add an empty assistant message that will be updated incrementally
            addMessage(currentChatId, "assistant", "");

            // Get the current chat to find the last message
            const chat = getCurrentChat();
            if (!chat) throw new Error("Current chat not found");

            // Get the last message which is the assistant message we just added
            const lastMessage = chat.messages[chat.messages.length - 1];
            if (!lastMessage || lastMessage.role !== "assistant") {
                throw new Error("Failed to find assistant message");
            }

            // Remember the message position for updates
            const assistantMessageIndex = chat.messages.length - 1;

            // Call the API with streaming
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error("Response body is null");
            }

            // Set up the reader for the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";
            let buffer = ""; // Add buffer for accumulating stream data

            // Read and process the stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode and add the chunk to the buffer
                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages in the buffer
                let boundary = buffer.indexOf("\n\n");
                while (boundary !== -1) {
                    const message = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 2); // Skip the boundary chars

                    // Process lines in the message
                    const lines = message.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            const jsonString = line.substring(5).trim();
                            if (jsonString) {
                                // Avoid parsing empty data lines
                                try {
                                    const chunk = JSON.parse(jsonString);
                                    // Check if the expected data structure is present
                                    if (
                                        chunk &&
                                        chunk.data &&
                                        typeof chunk.data.answer === "string"
                                    ) {
                                        // Assuming each chunk contains the complete answer up to that point
                                        accumulatedContent = chunk.data.answer;

                                        // Update the message content
                                        const currentChat = getCurrentChat();
                                        if (
                                            currentChat &&
                                            currentChat.messages.length >
                                                assistantMessageIndex
                                        ) {
                                            updateMessageContent(
                                                currentChatId,
                                                assistantMessageIndex,
                                                accumulatedContent
                                            );
                                        }
                                    } else {
                                        // Log unexpected structure if needed
                                        // console.warn("Received chunk with unexpected structure:", chunk);
                                    }
                                } catch (e) {
                                    console.error(
                                        "Failed to parse JSON chunk:",
                                        jsonString,
                                        e
                                    );
                                    // Handle parsing errors, maybe ignore the chunk or show an error message
                                }
                            }
                        }
                    }
                    boundary = buffer.indexOf("\n\n"); // Look for the next message boundary
                }
            }

            // Optional: Process any remaining data in the buffer after the stream ends
            // This might be needed if the stream doesn't end cleanly with \n\n
            if (buffer.startsWith("data:")) {
                const jsonString = buffer.substring(5).trim();
                if (jsonString) {
                    try {
                        const chunk = JSON.parse(jsonString);
                        if (
                            chunk &&
                            chunk.data &&
                            typeof chunk.data.answer === "string"
                        ) {
                            accumulatedContent = chunk.data.answer;
                            const currentChat = getCurrentChat();
                            if (
                                currentChat &&
                                currentChat.messages.length >
                                    assistantMessageIndex
                            ) {
                                updateMessageContent(
                                    currentChatId,
                                    assistantMessageIndex,
                                    accumulatedContent
                                );
                            }
                        }
                    } catch (e) {
                        console.error(
                            "Failed to parse final JSON chunk:",
                            jsonString,
                            e
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            addMessage(
                currentChatId,
                "assistant",
                "抱歉，我遇到了一个错误。请再试一次。"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle new chat
    const handleNewChat = () => {
        addChat();
    };

    // Handle clear chat
    const handleClearChat = () => {
        if (currentChatId) {
            clearMessages(currentChatId);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="border-b p-4 flex items-center justify-between bg-background sticky top-0 z-10">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-primary">社问</h1>
                </div>
                <div className="flex items-center gap-2">
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
                                disabled={
                                    !currentChatId ||
                                    (currentChat?.messages.length || 0) === 0
                                }
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    确认清空对话
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    此操作将删除当前对话中的所有消息，但保留对话本身。此操作不可撤消。
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearChat}>
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
            <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
                <ChatMessages messages={messages} isLoading={isLoading} />
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-background sticky bottom-0 z-10">
                <div className="max-w-4xl mx-auto w-full">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";

export function useChatHandler() {
    const { addMessage, getCurrentChat, updateMessageContent } = useChatStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (
        message: string,
        currentChatId: string | null
    ) => {
        if (!message.trim() || !currentChatId) return;

        addMessage(currentChatId, "user", message);
        setIsLoading(true);

        try {
            addMessage(currentChatId, "assistant", "");

            const chat = getCurrentChat();
            if (!chat) throw new Error("Current chat not found");

            const lastMessage = chat.messages[chat.messages.length - 1];
            if (!lastMessage || lastMessage.role !== "assistant") {
                throw new Error("Failed to find assistant message");
            }

            const assistantMessageIndex = chat.messages.length - 1;

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

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let boundary = buffer.indexOf("\n\n");
                while (boundary !== -1) {
                    const messageSegment = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 2);

                    const lines = messageSegment.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            const jsonString = line.substring(5).trim();
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
                                    } else {
                                        // console.warn("Received chunk with unexpected structure:", chunk);
                                    }
                                } catch (e) {
                                    console.error(
                                        "Failed to parse JSON chunk:",
                                        jsonString,
                                        e
                                    );
                                }
                            }
                        }
                    }
                    boundary = buffer.indexOf("\n\n");
                }
            }

            // Process remaining buffer data
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

    return { handleSendMessage, isLoading };
}

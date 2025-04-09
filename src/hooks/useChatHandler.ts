import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { v4 as uuidv4 } from "uuid";

interface StreamResponse {
	type: "content" | "metadata" | "error" | "done";
	content?: string;
	error?: string;
	conversationId?: string;
	totalTokens?: number;
	elapsedTime?: number;
}

async function streamChatResponse(message: string, conversationId: string) {
	return await fetch(`/api/${conversationId}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
		}),
	}).then((r) => r.body);
}

export function useChat() {
	const {
		addMessage,
		getCurrentChat,
		updateMessageContent,
		updateChatMetadata,
		addChat,
	} = useChatStore();
	const [isLoading, setIsLoading] = useState(false);
	const [streamMetadata, setStreamMetadata] = useState<{
		totalTokens?: number;
		elapsedTime?: number;
		conversationId?: string;
	}>({});

	const handleSendMessage = async (
		message: string,
		currentChatId: string | null,
	) => {
		if (!message.trim()) return;

		// Get current conversation ID or create a new one with UUID
		const chat = getCurrentChat();
		let chatId = currentChatId;
		let conversationId = chat?.conversationId || uuidv4();

		// If no current chat, create one
		if (!chatId) {
			chatId = addChat();
		}

		// Update the conversation with the UUID
		if (chatId) {
			updateChatMetadata(chatId, { conversationId });
		}

		if (!chatId) return;

		// Add user message to chat
		addMessage(chatId, "user", message);
		setIsLoading(true);
		let assistantMessageIndex = -1;

		try {
			// Add initial empty assistant message
			addMessage(chatId, "assistant", "");
			const updatedChat = getCurrentChat(); // Get chat after adding the message
			if (!updatedChat) {
				throw new Error("Current chat not found after update.");
			}
			assistantMessageIndex = updatedChat.messages.length - 1;

			// Get streaming response
			const stream = await streamChatResponse(message, conversationId);
			const reader = stream?.getReader();
			if (!reader) throw new Error("Failed to get stream reader.");
			const decoder = new TextDecoder("utf-8");
			let contentAccumulator = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const lines = decoder
					.decode(value, { stream: true })
					.split("\n")
					.filter((line) => line.trim() !== "");

				for (const line of lines) {
					try {
						const response = JSON.parse(line) as StreamResponse;

						switch (response.type) {
							case "content":
								if (response.content) {
									contentAccumulator += response.content;
									updateMessageContent(
										chatId,
										assistantMessageIndex,
										contentAccumulator,
									);
								}
								break;

							case "metadata":
								if (response.conversationId) {
									// Update chat with conversation ID for future messages
									updateChatMetadata(chatId, {
										conversationId: response.conversationId,
										totalTokens: response.totalTokens,
										elapsedTime: response.elapsedTime,
									});

									setStreamMetadata({
										conversationId: response.conversationId,
										totalTokens: response.totalTokens,
										elapsedTime: response.elapsedTime,
									});
								}
								break;

							case "error":
								throw new Error(response.error || "Unknown error in stream");

							case "done":
								// Stream is done, but we'll still let the reader.read() loop finish
								break;
						}
					} catch (error) {
						console.error("Error parsing stream response:", error, line);
						// Continue processing other lines if one fails
					}
				}
			}
		} catch (error) {
			console.error("Error sending message or processing stream:", error);
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred.";

			// Update the assistant message with error
			if (chatId && assistantMessageIndex !== -1) {
				updateMessageContent(
					chatId,
					assistantMessageIndex,
					`抱歉，处理时遇到错误： ${errorMessage}`,
				);
			} else if (chatId) {
				// Fallback if we couldn't add the initial placeholder
				addMessage(
					chatId,
					"assistant",
					`抱歉，发送消息时遇到错误： ${errorMessage}`,
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		handleSendMessage,
		isLoading,
		streamMetadata,
	};
}

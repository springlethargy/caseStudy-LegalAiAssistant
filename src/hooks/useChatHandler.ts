import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";

async function streamChatResponse(message: string) {
	return await fetch("/api/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message }),
	}).then((r) => r.body);
}

export function useChat() {
	const { addMessage, getCurrentChat, updateMessageContent } = useChatStore();
	const [isLoading, setIsLoading] = useState(false);

	const handleSendMessage = async (
		message: string,
		currentChatId: string | null,
	) => {
		if (!message.trim() || !currentChatId) return;

		addMessage(currentChatId, "user", message);
		setIsLoading(true);
		let assistantMessageIndex = -1;

		try {
			// Add initial empty assistant message
			addMessage(currentChatId, "assistant", "");
			const chat = getCurrentChat(); // Get chat *after* adding the message
			if (!chat) {
				console.error(
					"Failed to get current chat after adding assistant message placeholder.",
				);
				throw new Error("Current chat not found after update.");
			}
			assistantMessageIndex = chat.messages.length - 1; // Index of the newly added message

			const stream = await streamChatResponse(message);
			const reader = stream?.getReader();
			if (!reader) throw new Error("Failed to get stream reader.");
			const decoder = new TextDecoder("utf-8");
			let contentChunk = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const decoded = decoder
					.decode(value)
					.trim()
					.split("\n")
					.filter((line) => line.trim() !== "")[0];

                console.log(decoded)
				if (decoded.startsWith("data:")) {
					const json = JSON.parse(decoded.substring(5));
					if (json.event !== "message") {
						continue;
					}

					contentChunk += json.answer;
					const currentChatState = getCurrentChat();
					if (
						currentChatState &&
						currentChatState.messages.length > assistantMessageIndex
					) {
						updateMessageContent(
							currentChatId,
							assistantMessageIndex,
							contentChunk,
						);
					} else {
						console.warn(
							"Chat state inconsistent during stream update. Skipping update for chunk.",
						);
					}
				}
			}
		} catch (error) {
			console.error("Error sending message or processing stream:", error);
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred.";

			// Attempt to update the existing message or add a new one if index is invalid
			if (currentChatId && assistantMessageIndex !== -1) {
				const chat = getCurrentChat();
				// Check if the message still exists at the index
				if (
					chat &&
					chat.messages.length > assistantMessageIndex &&
					chat.messages[assistantMessageIndex].role === "assistant"
				) {
					updateMessageContent(
						currentChatId,
						assistantMessageIndex,
						`抱歉，处理时遇到错误： ${errorMessage}`,
					);
				} else {
					// If the original placeholder is gone for some reason, add a new error message
					addMessage(
						currentChatId,
						"assistant",
						`抱歉，获取回复时遇到错误： ${errorMessage}`,
					);
				}
			} else if (currentChatId) {
				// Fallback if we couldn't even add the initial placeholder
				addMessage(
					currentChatId,
					"assistant",
					`抱歉，发送消息时遇到错误： ${errorMessage}`,
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return { handleSendMessage, isLoading };
}

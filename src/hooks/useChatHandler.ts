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

// 修改：增加 isNewConversation 参数
async function streamChatResponse(
	message: string,
	conversationId: string,
	question_type: string,
	answer: string,
	answer_idea: string,
	isNewConversation: boolean, // 新增
) {
	return await fetch(`/api/${conversationId}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
			question_type,
			answer,
			answer_idea,
			isNewConversation, // 新增：将新对话标志放入请求体
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
	const [isTyping, setIsTyping] = useState(false); // 修改：新增 isTyping 状态
	const [streamMetadata, setStreamMetadata] = useState<{
		totalTokens?: number;
		elapsedTime?: number;
		conversationId?: string;
	}>({});

	const handleSendMessage = async (
		message: string,
		currentChatId: string | null,
		question_type: string,
		answer: string,
		answer_idea: string,
	) => {
		if (isLoading || isTyping) return; // 修改：在函数开头增加保护，防止在加载或打字时重复提交
		if (!message.trim() && !answer.trim() && !answer_idea.trim()) return;

		let chatId = currentChatId;

		// If no current chat, create one
		if (!chatId) {
			chatId = addChat();
		}
		
		// Add user message to chat
		addMessage(chatId, "user", message || answer || answer_idea);
		
		const chat = useChatStore.getState().chats.find(c => c.id === chatId);
		
		if (!chat) return;

		// 修改：判断是否为新对话
		const isNewConversation = chat.messages.filter(m => m.role === 'user').length === 1;
		
		// 修改：确保URL中总有一个有效的UUID，无论是已有的还是新生成的
		const conversationIdForUrl = chat.conversationId || uuidv4();
		if (!chat.conversationId) {
			updateChatMetadata(chatId, { conversationId: conversationIdForUrl });
		}

		setIsLoading(true);
		setIsTyping(true); // 修改：在请求开始时就设置isTyping，确保UI同步
		let assistantMessageIndex = -1;

		try {
			// Add initial empty assistant message
			addMessage(chatId, "assistant", "");
			const updatedChat = useChatStore.getState().chats.find(c => c.id === chatId); // Get chat after adding the message
			if (!updatedChat) {
				throw new Error("Current chat not found after update.");
			}
			assistantMessageIndex = updatedChat.messages.length - 1;

			// Get streaming response
			const stream = await streamChatResponse(
				message,
				conversationIdForUrl, // 修改：使用客户端的ID作为URL
				question_type,
				answer, 
				answer_idea, 
				isNewConversation, // 修改：传递新对话标志
			);
			const reader = stream?.getReader();
			if (!reader) throw new Error("Failed to get stream reader.");
			const decoder = new TextDecoder("utf-8");
			// [MODIFICATION]: 删除了 contentAccumulator 变量
            let buffer = ""; 

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const events = buffer.split("\n\n");
				buffer = events.pop() || ""; 

				for (const event of events) {
					if (!event.startsWith("data: ")) continue;
					try {
						const jsonData = event.substring(6);
						const response = JSON.parse(jsonData) as StreamResponse & { conversationId?: string };

						// 修改：在接收到事件时，捕获并存储Dify返回的真实ID
						if (response.conversationId && isNewConversation) {
							updateChatMetadata(chatId, { conversationId: response.conversationId });
						}

						switch (response.type) {
							case "content":
								if (response.content) {
									// --- [MODIFICATION]: 实现真正的流式更新 ---
									// 不再使用累加器，而是直接更新 zustand store
									const currentChatState = useChatStore.getState().chats.find(c => c.id === chatId);
									if (currentChatState && currentChatState.messages[assistantMessageIndex]) {
										const currentContent = currentChatState.messages[assistantMessageIndex].content;
										const newContent = currentContent + response.content;
										updateMessageContent(chatId, assistantMessageIndex, newContent);
									}
								}
								break;
							case "metadata":
								const finalChatState = useChatStore.getState().chats.find(c => c.id === chatId);
								updateChatMetadata(chatId, {
									conversationId: finalChatState?.conversationId,
									totalTokens: response.totalTokens,
									elapsedTime: response.elapsedTime,
								});
								setStreamMetadata({
									conversationId: finalChatState?.conversationId,
									totalTokens: response.totalTokens,
									elapsedTime: response.elapsedTime,
								});
								break;
							case "error":
								throw new Error(response.error || "Unknown error in stream");
							case "done":
								break;
						}
					} catch (error) {
						console.error("Error parsing stream response:", error, event);
					}
				}
			}

			// --- [MODIFICATION]: 在数据流完全结束后，统一更新状态 ---
			setIsLoading(false); 
			setIsTyping(false);

			// --- [MODIFICATION]: 删除了整个基于 setInterval 的伪流式打字机代码块 ---

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
			// 修改：在出错时，确保所有状态都重置
			setIsLoading(false);
			setIsTyping(false);
		}
	};

	return {
		handleSendMessage,
		isLoading,
		isTyping, // 修改：将 isTyping 返回
		streamMetadata,
	};
}
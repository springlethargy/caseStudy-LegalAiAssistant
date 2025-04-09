"use client";

import { useEffect, useRef } from "react";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import { useChatStore } from "@/lib/chat-store";
import { useChat } from "@/hooks/useChatHandler";
import { ChatHeader } from "@/components/chat/chat-header";

export default function Home() {
	const {
		chats,
		currentChatId,
		setCurrentChatId,
		addChat,
		getCurrentChat,
		clearMessages,
	} = useChatStore();

	const { handleSendMessage, isLoading, streamMetadata } = useChat();

	const currentChat = getCurrentChat();
	const messages = currentChat?.messages || [];
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

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

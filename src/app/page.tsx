"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/chat-store";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

export default function Home() {
	const router = useRouter();
	const { chats, addChat, getCurrentChat, updateChatMetadata } = useChatStore();

	// Create a new chat if needed and redirect to it
	useEffect(() => {
		let conversationId;
		let currentChat = getCurrentChat();

		// If there's a current chat with conversation ID, use it
		if (currentChat?.conversationId) {
			conversationId = currentChat.conversationId;
		}
		// If current chat exists but has no conversation ID, assign one
		else if (currentChat) {
			conversationId = uuidv4();
			updateChatMetadata(currentChat.id, { conversationId });
		}
		// Otherwise create a new chat with a conversation ID
		else {
			const newChatId = addChat();
			conversationId = uuidv4();
			updateChatMetadata(newChatId, { conversationId });
		}

		// Redirect to the chat page
		router.replace(`/chat/${conversationId}`);
	}, [addChat, getCurrentChat, updateChatMetadata, router]);

	// Show a loading state while redirecting
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<Image
				src="/main_logo.png"
				alt="UCASS Logo"
				width={300}
				height={300}
				className="mb-8"
				priority
			/>
			<p className="text-lg">Loading chat...</p>
		</div>
	);
}

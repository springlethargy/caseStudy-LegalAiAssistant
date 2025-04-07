import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

export type Chat = {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
};

interface ChatStore {
	chats: Chat[];
	currentChatId: string | null;
	setCurrentChatId: (id: string | null) => void;
	getCurrentChat: () => Chat | undefined;
	addChat: () => string;
	updateChatTitle: (id: string, title: string) => void;
	deleteChat: (id: string) => void;
	addMessage: (
		chatId: string,
		role: "user" | "assistant",
		content: string,
	) => void;
	clearMessages: (chatId: string) => void;
	updateMessageContent: (
		chatId: string,
		messageIndex: number,
		content: string,
	) => void;
}

export const useChatStore = create<ChatStore>()(
	persist(
		(set, get) => ({
			chats: [],
			currentChatId: null,

			setCurrentChatId: (id) => set({ currentChatId: id }),

			getCurrentChat: () => {
				const { chats, currentChatId } = get();
				return chats.find((chat) => chat.id === currentChatId);
			},

			addChat: () => {
				const newChat: Chat = {
					id: Date.now().toString(),
					title: "New conversation",
					messages: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				set((state) => ({
					chats: [newChat, ...state.chats],
					currentChatId: newChat.id,
				}));

				return newChat.id;
			},

			updateChatTitle: (id, title) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === id
							? {
									...chat,
									title,
									updatedAt: new Date(),
								}
							: chat,
					),
				}));
			},

			deleteChat: (id) => {
				const { currentChatId, chats } = get();

				// If deleting the current chat, select another one or null
				let newCurrentChatId = currentChatId;
				if (currentChatId === id) {
					const remainingChats = chats.filter((chat) => chat.id !== id);
					newCurrentChatId =
						remainingChats.length > 0 ? remainingChats[0].id : null;
				}

				set((state) => ({
					chats: state.chats.filter((chat) => chat.id !== id),
					currentChatId: newCurrentChatId,
				}));
			},

			addMessage: (chatId, role, content) => {
				set((state) => {
					// Generate a unique ID that includes a random component
					const uniqueId = `${Date.now()}-${Math.random()
						.toString(36)
						.substring(2, 9)}`;

					return {
						chats: state.chats.map((chat) => {
							if (chat.id !== chatId) return chat;

							const newMessage = {
								id: uniqueId,
								role,
								content,
							};

							// If this is the first user message, update the title
							let title = chat.title;
							if (role === "user" && chat.messages.length === 0) {
								title =
									content.length > 30
										? `${content.substring(0, 30)}...`
										: content;
							}

							return {
								...chat,
								title,
								messages: [...chat.messages, newMessage],
								updatedAt: new Date(),
							};
						}),
					};
				});
			},

			clearMessages: (chatId) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === chatId
							? {
									...chat,
									messages: [],
									updatedAt: new Date(),
								}
							: chat,
					),
				}));
			},

			updateMessageContent: (chatId, messageIndex, content) => {
				set((state) => ({
					chats: state.chats.map((chat) => {
						if (chat.id !== chatId) return chat;

						const newMessages = [...chat.messages];
						newMessages[messageIndex] = {
							...newMessages[messageIndex],
							content,
						};

						return {
							...chat,
							messages: newMessages,
							updatedAt: new Date(),
						};
					}),
				}));
			},
		}),
		{
			name: "ask-ucass-chat-store",
		},
	),
);

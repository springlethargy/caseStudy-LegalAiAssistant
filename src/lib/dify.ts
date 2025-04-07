export const executeChatflow = (
	question: string,
	conversationId = "",
	user: string = crypto.randomUUID(),
): Promise<Response> => {
	const url = `${process.env.DIFY_URL}/chat-messages`;
	const body = {
		inputs: {},
		query: question,
		response_mode: "streaming",
		conversation_id: conversationId,
		user: user,
	};
	return fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.DIFY_KEY}`,
		},
		body: JSON.stringify(body),
	}).then((response) => {
		if (!response.ok) {
			throw new Error(
				`Failed to execute with status ${response.status} ${response.statusText}`,
			);
		}

		return response;
	});
};

export async function* yieldChatflow(
	question: string,
	conversationId = "",
	user: string = crypto.randomUUID(),
) {
	const stream = await executeChatflow(question, conversationId, user);
	const reader = stream.body?.getReader();
	if (!reader) throw new Error("Failed to get stream reader.");
	const decoder = new TextDecoder();

	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			return true;
		}
		const lines = decoder
			.decode(value)
			.trim()
			.split("\n\n")
			.filter((s) => s.trim() !== "");
		for (let decoded of lines) {
			if (decoded.startsWith("data:")) {
				decoded = decoded.substring(5);
				yield decoded;
			}
		}
	}
}
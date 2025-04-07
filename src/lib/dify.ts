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

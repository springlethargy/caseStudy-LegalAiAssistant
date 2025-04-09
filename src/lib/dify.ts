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
		conversation_id: "",
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

// Interface for the Dify response events
export interface DifyEvent {
	event: string;
	task_id?: string;
	workflow_run_id?: string;
	message_id?: string;
	conversation_id?: string;
	answer?: string;
	created_at?: number;
	data?: Record<string, unknown>;
}

/**
 * Parses a Dify event string into a structured object
 */
export function parseDifyEvent(eventData: string): DifyEvent | null {
	try {
		if (eventData.trim() === "") return null;
		return JSON.parse(eventData);
	} catch (e) {
		console.error("Failed to parse Dify event:", e, eventData);
		return null;
	}
}

/**
 * Generator that yields parsed Dify events from a streaming response
 */
export async function* streamDifyEvents(
	question: string,
	conversationId = "",
	user: string = crypto.randomUUID(),
): AsyncGenerator<DifyEvent, boolean, unknown> {
	const stream = await executeChatflow(question, "", user);
	const reader = stream.body?.getReader();
	if (!reader) throw new Error("Failed to get stream reader.");
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) return true;

			// Add new data to buffer and process
			buffer += decoder.decode(value, { stream: true });

			// Extract complete SSE events (each starts with "data: ")
			const events = buffer.split("\n\n");
			buffer = events.pop() || ""; // Keep the last potentially incomplete event

			for (const event of events) {
				const trimmed = event.trim();
				if (trimmed.startsWith("data: ")) {
					const eventData = trimmed.substring(6); // Remove "data: " prefix
					const parsedEvent = parseDifyEvent(eventData);
					if (parsedEvent) {
						yield parsedEvent;
					}
				}
			}
		}
	} catch (error) {
		console.error("Error in streamDifyEvents:", error);
		throw error;
	} finally {
		reader.releaseLock();
	}
}

// 修改：为 executeChatflow 增加 answer 和 answer_idea 可选参数
export const executeChatflow = (
	question: string,
	conversationId = "",
	user: string = crypto.randomUUID(),
	question_type: string,
	answer?: string,
	answer_idea?: string,
): Promise<Response> => {
	const url = `${process.env.DIFY_URL}/chat-messages`;
	const body = {
		// 修改：将所有自定义变量放入 inputs 对象
		inputs: {
			question_type: question_type,
			answer: answer || "",
			answer_idea: answer_idea || "",
		},
		query: question,
		response_mode: "streaming",
		conversation_id: conversationId, // 使用传入的 conversationId
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
			return response.text().then(text => {
				throw new Error(
					`Failed to execute with status ${response.status} ${response.statusText}. Response: ${text}`
				);
			})
		}

		return response;
	});
};

// Interface for the Dify response events
// 修改：为 DifyEvent 接口中的 data 字段提供更精确的类型定义
export interface DifyEvent {
	event: string;
	task_id?: string;
	workflow_run_id?: string;
	message_id?: string;
	conversation_id?: string;
	answer?: string;
	created_at?: number;
	data?: {
		// 根据我们已知的 workflow_finished 事件结构来定义
		outputs?: {
			answer?: string; // 明确指出 outputs 中可能有 answer 字段
			[key: string]: any; // 允许 outputs 中有其他字段
		};
		// 根据我们已知的 metadata 结构来定义
		total_tokens?: number;
		elapsed_time?: number;
		// 允许 data 对象中有其他未预期的字段
		[key: string]: any; 
	};
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
// 修改：为 streamDifyEvents 增加 answer 和 answer_idea 可选参数
export async function* streamDifyEvents(
	question: string,
	conversationId = "",
	user: string = crypto.randomUUID(),
	question_type: string,
	answer?: string,
    answer_idea?: string,
): AsyncGenerator<DifyEvent, boolean, unknown> {
	// 修改：传递所有参数
	const stream = await executeChatflow(
        question, 
        conversationId, 
        user, 
        question_type,
        answer,
        answer_idea
    );
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
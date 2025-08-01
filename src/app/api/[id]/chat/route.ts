import { NextResponse } from "next/server";
import { streamDifyEvents } from "@/lib/dify";

export const runtime = "edge";

// 修改：增加 answer 和 answer_idea 可选字段，并增加 isNewConversation
export interface ChatRequest {
	message: string;
	userId?: string;
	question_type: string;
	answer?: string;
	answer_idea?: string;
	isNewConversation?: boolean; // 新增
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }, 
) {
	try {
		const clientConversationId = params.id; 

		const { message, userId, question_type, answer, answer_idea, isNewConversation } =
			(await request.json()) as ChatRequest;

		const conversationIdForDify = isNewConversation ? "" : clientConversationId;

		// Use a readable stream to handle the streaming response
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// --- 修改：增加标志位和变量，为方案B做准备 ---
					let messageReceived = false;
					let finalAnswerFromOutputs = "";
					let finalConversationId = "";

					for await (const event of streamDifyEvents(
						message,
						conversationIdForDify,
						userId,
						question_type,
						answer,
						answer_idea
					)) {
						if (event.conversation_id) {
							finalConversationId = event.conversation_id; // 持续捕获最新的会话ID
						}

						if (event.event === "message" && event.answer) {
							messageReceived = true; // 标记我们收到了流式消息
							controller.enqueue(
								`data: ${JSON.stringify({
									type: "content",
									content: event.answer,
									conversationId: event.conversation_id
								})}\n\n`,
							);
						} else if (event.event === "workflow_finished") {
							// 尝试从结束事件的 outputs 中提取 answer 字段
							if (event.data?.outputs?.answer) {
								finalAnswerFromOutputs = event.data.outputs.answer as string;
                            }
							// 发送元数据事件
							controller.enqueue(
								`data: ${JSON.stringify({
									type: "metadata",
									totalTokens: event.data?.total_tokens,
									elapsedTime: event.data?.elapsed_time,
									conversationId: event.conversation_id, 
								})}\n\n`,
							);
						}
					}

					// --- 新增：方案B的核心逻辑 ---
					// 在整个流程结束后，检查是否收到过流式消息
					if (!messageReceived && finalAnswerFromOutputs) {
						// 如果从未收到过，并且我们在结束事件里找到了答案，就在这里把它作为单次 content 事件发送出去
						controller.enqueue(
							`data: ${JSON.stringify({
								type: "content",
								content: finalAnswerFromOutputs,
								conversationId: finalConversationId
							})}\n\n`,
						);
					}

					// Signal completion
					controller.enqueue(`data: ${JSON.stringify({ type: "done" })}\n\n`);
					controller.close();
				} catch (error) {
					console.error("Error processing stream:", error);
					controller.enqueue(
						`data: ${JSON.stringify({
							type: "error",
							error: error instanceof Error ? error.message : "Unknown error",
						})}\n\n`,
					);
					controller.close();
				}
			},
		});

		// Return the stream with proper headers for SSE
		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache, no-transform",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Error in chat API:", error);
		return NextResponse.json(
			{ error: "Failed to process message" },
			{ status: 500 },
		);
	}
}
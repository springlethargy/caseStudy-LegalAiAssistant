import { NextResponse } from "next/server";
import { streamDifyEvents } from "@/lib/dify";

export const runtime = "edge";

export interface ChatRequest {
	message: string;
	userId?: string;
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const localConversationId = await params;

		const { message, userId } = (await request.json()) as ChatRequest;

		// Use a readable stream to handle the streaming response
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Use the streamDifyEvents function to get parsed events
					for await (const event of streamDifyEvents(message, "", userId)) {
						if (event.event === "message" && event.answer) {
							// For message events, send only the answer chunks
							controller.enqueue(
								`${JSON.stringify({
									type: "content",
									content: event.answer,
								})}\n`,
							);
						} else if (event.event === "workflow_finished") {
							// Send metadata about the completion but preserve our local conversationId
							controller.enqueue(
								`${JSON.stringify({
									type: "metadata",
									totalTokens: event.data?.total_tokens,
									elapsedTime: event.data?.elapsed_time,
									conversationId: localConversationId.id,
								})}\n`,
							);
						}
					}

					// Signal completion
					controller.enqueue(`${JSON.stringify({ type: "done" })}\n`);
					controller.close();
				} catch (error) {
					console.error("Error processing stream:", error);
					controller.enqueue(
						`${JSON.stringify({
							type: "error",
							error: error instanceof Error ? error.message : "Unknown error",
						})}\n`,
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

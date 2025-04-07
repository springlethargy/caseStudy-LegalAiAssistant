import { NextResponse } from "next/server";
import { executeChatflow, yieldChatflow } from "@/lib/dify";

export async function POST(request: Request) {
	try {
		const { message } = await request.json();
		const streamingResponse = await yieldChatflow(message);
		const stream = new ReadableStream({
			async start(controller) {
				for await (const chunk of streamingResponse) {
					controller.enqueue(`${chunk}\n\n`);
				}
				controller.close();
			},
		});

		// Return the stream as the response
		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Transfer-Encoding": "chunked",
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

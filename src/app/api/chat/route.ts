import { NextResponse } from "next/server";
import { executeChatflow } from "@/lib/dify";

export async function POST(request: Request) {
	try {
		const { message } = await request.json();
		const streamingResponse = await executeChatflow(message);

		// Return the stream as the response
		return new NextResponse(streamingResponse.body, {
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

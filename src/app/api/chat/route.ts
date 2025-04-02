import { NextResponse } from "next/server";
import { openai, getModelName } from "@/lib/openai";
import { createSession, getChatStream } from "@/lib/ragflow";

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const sessionId = await createSession();
        const streamingResponse = await getChatStream(message, sessionId);

        // Return the stream as the response
        return new NextResponse(streamingResponse, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}

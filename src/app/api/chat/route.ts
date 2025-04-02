import { NextResponse } from "next/server";
import { openai, getModelName } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Create a new ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        // Create streaming completion
        const streamingResponse = await openai.chat.completions.create({
          model: getModelName(),
          messages: [
            {
              role: "system",
              content:
                "你是中国社会科学院大学(UCASS)的智能助手，你可以回答关于学校的各种问题。但如果是你不知道的问题，请不要回答。请用中文回复。",
            },
            { role: "user", content: message },
          ],
          temperature: 0.2,
          max_tokens: 1000,
          stream: true,
        });

        // Process the streaming response
        for await (const chunk of streamingResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // Encode and send the content chunk
            const encodedChunk = new TextEncoder().encode(content);
            controller.enqueue(encodedChunk);
          }
        }
        controller.close();
      },
      cancel() {
        // Handle cancellation if needed
      },
    });

    // Return the stream as the response
    return new NextResponse(stream, {
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

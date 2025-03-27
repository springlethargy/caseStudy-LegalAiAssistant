import { NextResponse } from "next/server";
import { openai, getModelName } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Use OpenAI client to generate a response
    const response = await openai.chat.completions.create({
      model: getModelName(),
      messages: [
        {
          role: "system",
          content:
            "你是中国社会科学院大学(UCASS)的智能助手，你可以回答关于学校的各种问题。请用中文回复。",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the response from the API result
    const aiMessage =
      response.choices[0]?.message?.content || "抱歉，我无法处理您的请求。";

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

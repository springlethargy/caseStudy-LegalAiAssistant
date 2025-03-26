import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // In a real implementation, you would connect to an AI API here
    // For demonstration purposes, we'll use a simple response generator
    const response = generateResponse(message);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// Simple response generator for demo
function generateResponse(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I assist you with UCASS today?";
  } else if (lowerMessage.includes("help")) {
    return "I'm here to help! You can ask me questions about UCASS, and I'll do my best to assist you.";
  } else if (lowerMessage.includes("thank")) {
    return "You're welcome! Is there anything else you'd like to know?";
  } else if (
    lowerMessage.includes("course") ||
    lowerMessage.includes("class")
  ) {
    return "UCASS offers various courses across different departments. To get specific information about a course, please provide the course code or name.";
  } else if (
    lowerMessage.includes("admission") ||
    lowerMessage.includes("apply")
  ) {
    return "The admission process for UCASS typically involves submitting an application, providing transcripts, and meeting specific requirements. The application deadline is usually in early spring for fall admission.";
  } else if (
    lowerMessage.includes("faculty") ||
    lowerMessage.includes("professor")
  ) {
    return "UCASS has a diverse faculty with expertise in various fields. You can find more information about specific professors on the university directory or department websites.";
  } else {
    return "Thank you for your question about UCASS. In a complete implementation, I would connect to an API to provide relevant answers tailored to your specific query.";
  }
}

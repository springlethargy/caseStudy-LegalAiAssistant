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

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("你好")
  ) {
    return "你好！我是UCASS助手，有什么可以帮助您的吗？";
  } else if (lowerMessage.includes("help") || lowerMessage.includes("帮助")) {
    return "我很乐意帮助您！请告诉我您有关于UCASS的什么问题，我会尽力提供相关信息。";
  } else if (lowerMessage.includes("thank") || lowerMessage.includes("谢谢")) {
    return "不客气！如果您还有其他问题，随时可以问我。";
  } else if (
    lowerMessage.includes("course") ||
    lowerMessage.includes("class") ||
    lowerMessage.includes("课程")
  ) {
    return "UCASS提供各种学科的课程。如果您想了解特定课程的信息，请提供课程代码或名称，我会为您查询详细信息。";
  } else if (
    lowerMessage.includes("admission") ||
    lowerMessage.includes("apply") ||
    lowerMessage.includes("申请") ||
    lowerMessage.includes("入学")
  ) {
    return "UCASS的入学申请流程通常包括提交申请表、成绩单和满足特定要求。秋季入学的申请截止日期通常在春季初。您需要特定专业的申请信息吗？";
  } else if (
    lowerMessage.includes("faculty") ||
    lowerMessage.includes("professor") ||
    lowerMessage.includes("教师") ||
    lowerMessage.includes("教授")
  ) {
    return "UCASS拥有各领域的专业教师团队。您可以在学校目录或院系网站上找到特定教授的更多信息。您想了解哪个学院的教师信息？";
  } else if (
    lowerMessage.includes("费用") ||
    lowerMessage.includes("学费") ||
    lowerMessage.includes("tuition")
  ) {
    return "UCASS的学费根据专业和学生类型（本地/国际）而有所不同。一般来说，本科课程的学费大约在每学期X元到Y元之间。您需要了解特定专业的费用信息吗？";
  } else if (
    lowerMessage.includes("宿舍") ||
    lowerMessage.includes("住宿") ||
    lowerMessage.includes("dormitory")
  ) {
    return "UCASS为学生提供多种住宿选择，包括校内宿舍和校外公寓。校内宿舍通常配备基本家具、网络和公共活动区域。您想了解更多关于住宿费用还是申请流程？";
  } else if (
    lowerMessage.includes("奖学金") ||
    lowerMessage.includes("scholarship")
  ) {
    return "UCASS提供多种奖学金和助学金，包括学术成就奖、体育特长奖和经济需求助学金。大多数奖学金的申请截止日期在每年春季。您想了解特定奖学金的申请条件吗？";
  } else {
    return "感谢您关于UCASS的提问。在完整的实现中，我会连接到专门的API以提供针对您特定问题的相关答案。请问您还有其他问题吗？";
  }
}

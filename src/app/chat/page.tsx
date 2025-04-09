"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function ChatRedirect() {
    const router = useRouter();

    useEffect(() => {
        // 生成新的 UUID
        const conversationId = uuidv4();

        // 重定向到带有 UUID 的详细聊天页面
        router.replace(`/chat/${conversationId}`);
    }, [router]);

    // 显示加载状态
    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-lg">正在加载聊天...</p>
        </div>
    );
} 
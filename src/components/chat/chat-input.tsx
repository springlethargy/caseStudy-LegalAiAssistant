"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// 修改：新的props接口，只接收onNewChat函数
interface ChatInputProps {
	onNewChat: () => void;
}

export default function ChatInput({ onNewChat }: ChatInputProps) {
	return (
		<div className="rounded-xl border bg-background p-4 text-center">
			<p className="text-sm text-muted-foreground mb-4">
				当前版本仅支持单轮案例分析。如需分析新案例，请开启新的对话。
			</p>
			<Button onClick={onNewChat}>
				<PlusCircle className="h-4 w-4 mr-2" />
				开启新对话
			</Button>
		</div>
	);
}
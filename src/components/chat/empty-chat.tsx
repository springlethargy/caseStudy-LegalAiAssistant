"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotMessageSquare } from "lucide-react";

// 定义这个组件需要接收的 props
interface EmptyChatProps {
	onStartChat: (
		message: string,
		questionType: string,
		answer: string,
		answer_idea: string
	) => void;
	isLoading: boolean;
}

export function EmptyChat({ onStartChat, isLoading }: EmptyChatProps) {
	// 使用 state 管理表单的各个输入值
	const [questionType, setQuestionType] = useState("宪法");
	const [userAnswer, setUserAnswer] = useState("");
	const [userAnswerIdea, setUserAnswerIdea] = useState("");
	const [message, setMessage] = useState("");

	const handleStart = () => {
		// 只有当主要案例描述（message）不为空时才启动
		if (message.trim()) {
			onStartChat(message, questionType, userAnswer, userAnswerIdea);
		}
	};

	return (
		<div className="flex items-center justify-center h-full">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BotMessageSquare className="h-6 w-6" />
						宪法案例鉴定式分析
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label>需进行哪个部门法的案例分析</Label>
						<Select
							name="question-type"
							value={questionType}
							onValueChange={setQuestionType}
							disabled={isLoading}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="宪法">宪法</SelectItem>
								<SelectItem value="民法" disabled>民法 (开发中)</SelectItem>
								<SelectItem value="刑法" disabled>刑法 (开发中)</SelectItem>
								<SelectItem value="行政法" disabled>行政法 (开发中)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="main-message">案例描述 (必填)</Label>
						<Textarea
							id="main-message"
							placeholder="请在此输入需要分析的案例..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="h-[120px] overflow-y-auto"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="user-answer">您的答案 (选填)</Label>
						<Textarea
							id="user-answer"
							placeholder="如果您希望AI评价您的答案，请在此输入..."
							value={userAnswer}
							onChange={(e) => setUserAnswer(e.target.value)}
							className="h-[60px] overflow-y-auto"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="user-idea">您的分析思路 (选填)</Label>
						<Textarea
							id="user-idea"
							placeholder="您还可以提供您的分析思路..."
							value={userAnswerIdea}
							onChange={(e) => setUserAnswerIdea(e.target.value)}
							className="h-[60px] overflow-y-auto"
						/>
					</div>
					<Button
						onClick={handleStart}
						disabled={!message.trim() || isLoading}
						className="w-full"
					>
						{isLoading ? "正在分析..." : "开始分析"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
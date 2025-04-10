"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Message } from "@/lib/chat-store";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

interface FeedbackFormProps {
    message: Message;
    prevMessage?: Message;
    isLoading: boolean;
}

export function FeedbackForm({ message, prevMessage, isLoading }: FeedbackFormProps) {
    const [rating, setRating] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const params = useParams();
    const conversationId = params.id as string;

    // Delay showing the feedback form to make it appear after message
    useEffect(() => {
        if (!isLoading && message.role === "assistant") {
            const timer = setTimeout(() => {
                setShowFeedback(true);
            }, 800); // Delay showing feedback form

            return () => clearTimeout(timer);
        }
    }, [isLoading, message.role]);

    const handleRatingChange = async (value: number) => {
        if (submitted || isSubmitting) return;

        setRating(value);
        setIsSubmitting(true);

        try {
            // Only submit if we have both the question and answer
            if (message.role === "assistant" && prevMessage?.role === "user") {
                const response = await fetch("/api/submit-feedback", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: prevMessage.content,
                        response: message.content,
                        rate: value,
                        id: conversationId
                    }),
                });

                if (response.ok) {
                    setSubmitted(true);
                } else {
                    console.error("Failed to submit feedback");
                }
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Only show feedback form for assistant messages and when not loading and after delay
    if (message.role !== "assistant" || isLoading || !showFeedback) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="mt-4"
            >
                <Card className="p-4 bg-muted/30 border-muted">
                    <div className="flex flex-col">
                        <div className="text-sm font-medium mb-2">请对回答进行评分</div>
                        <div className="flex items-center">
                            <StarRating
                                value={rating}
                                onChange={handleRatingChange}
                                className={submitted ? "opacity-60 pointer-events-none" : ""}
                            />
                            {submitted && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-muted-foreground ml-2"
                                >
                                    感谢您的反馈!
                                </motion.span>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
} 
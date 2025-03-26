"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MenuIcon } from "lucide-react";
import Link from "next/link";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to add a new message
  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role, content },
    ]);
  };

  // Function to handle user message submission
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    addMessage("user", message);

    // Show loading state
    setIsLoading(true);

    try {
      // Simulate AI response after a delay
      setTimeout(() => {
        addMessage("assistant", generateResponse(message));
        setIsLoading(false);
      }, 1000);

      // In a real application, you'd make an API call here
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message })
      // });
      // const data = await response.json();
      // addMessage('assistant', data.message);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Simple response generator for demo
  const generateResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! How can I assist you with UCASS today?";
    } else if (lowerMessage.includes("help")) {
      return "I'm here to help! You can ask me questions about UCASS, and I'll do my best to assist you.";
    } else if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else you'd like to know?";
    } else {
      return "I understand you're asking about UCASS. As a demo, I have limited responses. In a complete implementation, I would connect to an API to provide relevant answers.";
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([]);
    setSelectedChat(null);
    setIsSidebarOpen(false);
  };

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    // In a real app, we would load messages for the selected chat
    // For demo, just reset messages
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block h-screen">
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile sidebar (slide-in) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
            <ChatSidebar
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
            <Link href="/" className="md:block">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-semibold">Ask UCASS</h1>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(80vh-80px)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            <p className="text-sm">👋 Hi! I can help you with:</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>• Understanding your spending patterns</p>
              <p>• Analyzing your expenses</p>
              <p>• Providing budgeting tips</p>
              <p>• Explaining financial terms</p>
            </div>
          </div>
        )}
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === "user"
                  ? "bg-black text-white dark:bg-gray-900"
                  : "bg-[#f5f5f5] text-black dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f5f5f5] dark:bg-gray-800 text-black dark:text-gray-100 rounded-lg px-4 py-2 animate-pulse">
                Analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-background">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your expenses..."
            className="flex-1 border-gray-200 dark:border-gray-800"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading}
            className="hover:scale-105 transition-transform"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

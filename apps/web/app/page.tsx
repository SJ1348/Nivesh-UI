"use client";

import { Button, ScrollArea } from "@repo/ui";
import { Textarea } from "@repo/ui";
import { cn } from "@repo/ui/utils";
import { useState, useRef, useEffect } from "react";
import { Copy, Download, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "agent" | "user"
  content: string
  timestamp: string
}

function AnimatedDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  );
}

function ChatInterface() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Hello, I'm Nivesh, a financial AI agent. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }),
    },
  ])
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Also scroll when the last message is an agent response and not loading
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "agent" &&
      messages[messages.length - 1].content !== "..."
    ) {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    // Show agent is typing/loading
    setMessages((prev) => [
      ...prev,
      { role: "agent", content: "...", timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }) },
    ]);
    try {
      const res = await fetch("https://backend.avyaya.co/chat", {
        method: "POST",
        headers: { "accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove loading
        { role: "agent", content: data?.output || "No response.", timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }) },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "agent", content: "Sorry, something went wrong.", timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }) },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const strategyButtons = [
    "V20 Strategy",
    "Range Bound Strategy",
    "SMA Strategy",
    "Reverse Head and Shoulder Strategy",
    "Cup with Handle Strategy",
    "Fifty Two Week Low Stratrgy",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-blue-100/50">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
          <div className="flex flex-col items-center pt-12 pb-6">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <h1 className="text-2xl font-semibold text-center">Where shall we invest today?</h1>
            <p className="text-gray-600 text-sm text-center">Get a list of new stocks everyday at your finger tips.</p>
          </div>
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 px-2 pb-4">
              <div className="space-y-8 py-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-2 max-w-full", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "agent" && (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                        N
                      </div>
                    )}
                    <div className={cn("space-y-2 max-w-[80%]")}>
                      <div
                        className={cn(
                          "p-4 rounded-lg shadow-md",
                          message.role === "agent"
                            ? "bg-white border border-blue-100"
                            : "bg-blue-600 text-white"
                        )}
                      >
                        {message.role === "agent" ? (
                          <div className="prose prose-sm max-w-full">
                            {message.content === "..." ? <AnimatedDots /> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      {message.role === "agent" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={async () => {
                              await navigator.clipboard.writeText(message.content);
                              setCopiedIndex(index);
                              setTimeout(() => setCopiedIndex(null), 1200);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy message</span>
                          </Button>
                          {copiedIndex === index && (
                            <span className="text-xs text-blue-500">Copied!</span>
                          )}
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-blue-400 flex-shrink-0 flex items-center justify-center text-white">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="w-full mt-auto">
              <div className="p-4 border-t bg-white rounded-xl mb-6 shadow-sm sticky bottom-0 z-10 shadow-md">
                <div className="flex gap-2 p-2 bg-white rounded-lg border border-blue-100">
                  <Textarea
                    placeholder="Enter a prompt..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[44px] max-h-32 border-0 focus-visible:ring-0 resize-none"
                  />
                  <Button className="rounded-full h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600" onClick={handleSendMessage}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {strategyButtons.map((label, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setInput(`Give me stocks for that satisfy the ${label}.`)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="text-center text-xs text-gray-500 mt-4">
                  AI can make mistakes. Consider checking important information
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ChatInterface />
  );
}
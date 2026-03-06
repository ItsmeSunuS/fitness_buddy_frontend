import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import AnimatedPage from "@/components/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

interface Buddy {
  _id: string;
  name: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const res = await api.get("/api/buddies");
        setBuddies(res.data);
      } catch {
        setBuddies([
          { _id: "1", name: "Sarah Chen" },
          { _id: "2", name: "Mike Johnson" },
          { _id: "3", name: "Alex Rivera" },
          { _id: "4", name: "Emily Davis" },
        ]);
      }
    };
    fetchBuddies();
  }, []);

  useEffect(() => {
    if (!selectedBuddy) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${selectedBuddy._id}`);
        setMessages(res.data);
      } catch {
        // Mock conversation
        setMessages([
          { _id: "m1", senderId: selectedBuddy._id, receiverId: user?._id || "", text: "Hey! Ready for today's workout? 💪", timestamp: new Date(Date.now() - 3600000).toISOString() },
          { _id: "m2", senderId: user?._id || "", receiverId: selectedBuddy._id, text: "Absolutely! Let's crush it!", timestamp: new Date(Date.now() - 3000000).toISOString() },
          { _id: "m3", senderId: selectedBuddy._id, receiverId: user?._id || "", text: "I was thinking we could do HIIT today", timestamp: new Date(Date.now() - 2400000).toISOString() },
          { _id: "m4", senderId: user?._id || "", receiverId: selectedBuddy._id, text: "Sounds great! Meet at the gym at 6?", timestamp: new Date(Date.now() - 1800000).toISOString() },
        ]);
      }
    };
    fetchMessages();
  }, [selectedBuddy, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedBuddy) return;
    const msg: Message = {
      _id: `m${Date.now()}`,
      senderId: user?._id || "",
      receiverId: selectedBuddy._id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      await api.post("/api/messages", { receiverId: selectedBuddy._id, text: newMessage.trim() });
    } catch { /* offline fallback */ }
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredBuddies = buddies.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <AnimatedPage>
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Messages 💬</h1>

        <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Buddy list sidebar */}
          <div className="flex w-80 flex-col border-r border-border">
            <div className="border-b border-border p-4">
              <input
                type="text"
                placeholder="Search buddies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredBuddies.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No buddies found. Add buddies first!</p>
              ) : (
                filteredBuddies.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelectedBuddy(b)}
                    className={`flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedBuddy?._id === b._id ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {b.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{b.name}</p>
                      <p className="truncate text-xs text-muted-foreground">Tap to chat</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-1 flex-col">
            {selectedBuddy ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {selectedBuddy.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedBuddy.name}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span className="mb-4 text-6xl">💬</span>
                <h3 className="font-display text-xl font-semibold text-foreground">Select a buddy to chat</h3>
                <p className="mt-1 text-sm text-muted-foreground">Choose someone from your buddy list to start a conversation</p>
              </div>
            )}
          </div>
        </div>
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Messages;

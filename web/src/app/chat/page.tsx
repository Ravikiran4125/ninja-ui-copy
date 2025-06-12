"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(e: React.FormEvent) {
    console.log("event starts")
    e.preventDefault();
    setError(null);
    console.log("event continues")
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const status = res.status;
      console.log(status, "HTTP Status");
    
      const text = await res.text();
      console.log(text, "Raw response");
    
      const data = JSON.parse(text);
      console.log(data, "data");
      if (res.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.result?.result?.finalAnswer || JSON.stringify(data.result) }]);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
    setLoading(false);
    setInput("");
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2>AI Crew Orchestration Chatbot</h2>
      <div style={{ minHeight: 200, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0", color: m.role === "user" ? "#222" : "#0b6efd" }}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.content}
          </div>
        ))}
        {loading && <div style={{ color: "#888" }}>AI is thinking...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: "8px 16px", borderRadius: 6, background: "#0b6efd", color: "#fff", border: "none" }}>
          Send
        </button>
      </form>
    </div>
  );
}

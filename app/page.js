'use client';
import { useState, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input }),
    });
    const { answer } = await res.json();
    const botMsg = { role: 'assistant', text: answer };
    setMessages((m) => [...m, botMsg]);

    // scroll to latest
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">🎤 Ask My Resume</h1>

      <div className="w-full max-w-xl flex-1 overflow-auto border rounded-lg bg-white p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="w-full max-w-xl mt-4 flex">
        <input
          className="flex-1 border rounded-l-lg px-3 py-2 outline-none"
          placeholder="Ask me about my experience..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r-lg"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}

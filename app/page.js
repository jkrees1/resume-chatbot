'use client';
import { useState, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  async function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: input }]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { answer } = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Error: could not reach the server.' },
      ]);
    } finally {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  }

  return (
    <div
      className="flex items-center justify-center bg-gray-50"
      style={{ minHeight: '100vh', padding: '1rem' }}
    >
      <div className="w-full max-w-xl flex flex-col">
        <h1 className="text-3xl font-heading font-bold mb-4">
          Ask me a question
        </h1>

        <div className="flex-1 overflow-auto border rounded-lg bg-white p-4 mb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
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

        <div className="flex">
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
    </div>
  );
}

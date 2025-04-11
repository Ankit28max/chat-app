import { useEffect, useRef, useState } from "react";
import "./App.css";

interface Message {
  message: string;
  sender: "you" | "other";
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // ✅ use ws:// not http://
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "red",
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    const message = inputRef.current?.value;
    if (!message || message.trim() === "") return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message,
        },
      })
    );

    inputRef.current.value = "";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      <header className="text-center text-2xl font-semibold py-4 border-b border-gray-700">
        🔴 Chat Room - Red
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`rounded-xl px-4 py-2 max-w-[70%] text-sm ${
                msg.sender === "you"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-900 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-purple-600"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;

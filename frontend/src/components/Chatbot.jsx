import React, { useState } from "react";
import { askChatbot } from '../services/api';
import { Send, Bot, User, RotateCcw } from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatbot_history');
    return saved ? JSON.parse(saved) : [
      { sender: "bot", text: "Hello! I am your GenAI assistant. How may I help you?" },
    ];
  });
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    // FAQ matching
    try {
      const res = await askChatbot(input);
      const botReply = res.reply || "Sorry, I couldn't understand that.";
      setMessages(prev => {
        const updated = [...prev, { sender: "bot", text: botReply }];
        localStorage.setItem('chatbot_history', JSON.stringify(updated));
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev, { sender: "bot", text: "Error connecting to chatbot." }];
        localStorage.setItem('chatbot_history', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Save chat history on every message change
  React.useEffect(() => {
    localStorage.setItem('chatbot_history', JSON.stringify(messages));
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClearChat = () => {
    const initial = [
      { sender: "bot", text: "Hello! I am your GenAI assistant. How may I help you?" },
    ];
    setMessages(initial);
    localStorage.setItem('chatbot_history', JSON.stringify(initial));
  };

  return (
    <div className="bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter flex items-start max-w-full">
      {/* Sidebar - Chat History */}
      <aside className="hidden md:flex flex-col w-72 bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-6 mr-8 h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#013362]">Chat History</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-[#005193] text-xs font-semibold hover:underline" onClick={handleClearChat}>
              <RotateCcw className="w-4 h-4" /> Clear Chat
            </button>
          </div>
        </div>
        <ul className="space-y-3 text-sm text-gray-700 flex-1 overflow-y-auto">
          <li className="bg-blue-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition">Check status for my application (Job ID 456)</li>
          <li className="bg-blue-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition">What is the salary range for the Analyst role?</li>
          <li className="bg-blue-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition">How long is the interview process?</li>
          <li className="bg-blue-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition">Can I update my resume?</li>
          <li className="bg-blue-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition">What are the company’s core values?</li>
        </ul>
      </aside>
      {/* Main Chat Area */}
      <div className="w-full max-w-full flex flex-col flex-1 bg-white/90 rounded-2xl border border-gray-200 shadow-inner p-0 sm:p-6 h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4 px-6 pt-6">
          <h1 className="text-2xl font-extrabold text-[#013362]">AI Assistant Chatbot</h1>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 px-2 pb-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse text-right" : "flex-row text-left"}`}
              >
                <div
                  className={`p-3 rounded-2xl shadow text-sm ${msg.sender === "user" ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white" : "bg-gray-200 text-gray-900"}`}
                >
                  {msg.text}
                </div>
                {msg.sender === "bot" ? (
                  <Bot className="w-5 h-5 mt-1 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 mt-1 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Input Bar */}
        <div className="flex items-center mt-4 border-t border-gray-300 pt-3 px-6 pb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none"
          />
          <button
            type="button"
            className="ml-3 bg-gradient-to-r from-[#013362] to-[#005193] text-white rounded-xl p-3 flex items-center justify-center"
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
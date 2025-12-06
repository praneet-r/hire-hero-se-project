import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { askGemini } from "../services/gemini";
import { Send, RotateCcw, Plus, Bot, User, Bell, Users, Briefcase, Megaphone, BarChart2, FileText, Settings, Download, Sparkles, LogOut, BarChart } from "lucide-react";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";
import EmployeesTab from "../components/EmployeesTab";
import RecruitmentTab from "../components/RecruitmentTab";
import Performance from "../components/PerformanceTab";
import Analytics from "../components/AnalyticsTab";


const tabConfig = [
  { tab: "dashboard", icon: BarChart2 },
  { tab: "employees", icon: Users },
  { tab: "recruitment", icon: Briefcase },
  { tab: "performance", icon: BarChart },
  { tab: "analytics", icon: BarChart2 },
];

const HRGenAI = ({ onNewChat }) => {
  const [activeTab, setActiveTab] = useState("chatbot");
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "dashboard") {
      navigate("/dashboard-hr");
    }
  }, [activeTab, navigate]);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your HR GenAI Assistant. How may I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [botThinking, setBotThinking] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setBotThinking(true);
    try {
      const aiText = await askGemini(input);
      setBotThinking(false);
      const aiResponse = { sender: "bot", text: aiText };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setBotThinking(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, AI service is unavailable." }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const startNewChat = () => {
    setMessages([{ sender: "bot", text: "New chat started! How may I assist you today?" }]);
    if (onNewChat) onNewChat();
  };

  return (
    <section className="min-h-screen flex bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter">
      <SidebarHR />
      <main className="flex-1 flex flex-col">
        <TopNavbarHR activeTab={activeTab} setActiveTab={setActiveTab} tabConfig={tabConfig} />

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-extrabold text-[#013362] mb-6">Welcome to the HR Dashboard</h2>
            {/* You can add dashboard widgets or summary cards here */}
          </div>
        )}
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "recruitment" && <RecruitmentTab />}
        {activeTab === "performance" && <Performance />}
        {activeTab === "analytics" && <Analytics fetchAnalyticsData={async () => ({metrics: {employeeSatisfaction: 90, turnoverRate: 8, avgSalary: 65000, trainingCompletion: 85}, workforceTrends: [], departmentBreakdown: []})} />}
        {/* Default: GenAI Chatbot */}
        {!["dashboard","employees","recruitment","performance","analytics"].includes(activeTab) && (
          <div className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#013362]">AI Chatbot</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90"
                  onClick={() => alert('Chat history feature coming soon!')}
                >
                  <RotateCcw className="w-4 h-4" /> Chat History
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
                  onClick={startNewChat}
                >
                  <Plus className="w-4 h-4" /> New Chat
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <CategoryCard title="Employee Queries" />
              <CategoryCard title="Recruitment Help" />
              <CategoryCard title="Analytics Insights" />
              <CategoryCard title="Compliance" />
            </div>

            {/* Chat Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-inner h-[580px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[75%] ${
                        msg.sender === "user"
                          ? "flex-row-reverse text-right"
                          : "flex-row text-left"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl shadow text-sm ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
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
                {botThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 max-w-[75%] flex-row text-left">
                      <div className="p-3 rounded-2xl shadow text-sm bg-gray-200 text-gray-900 animate-pulse">
                        Bot is thinking...
                      </div>
                      <Bot className="w-5 h-5 mt-1 text-lg text-blue-600 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="flex items-center mt-4 border-t border-gray-300 pt-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about HR..."
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
        )}
      </main>
    </section>
  );
};


const CategoryCard = ({ title }) => (
  <div className="p-4 bg-white hover:bg-blue-50 cursor-pointer rounded-xl border border-gray-200 shadow-sm transition text-center">
    <p className="font-medium text-gray-800">{title}</p>
  </div>
);

export default HRGenAI;
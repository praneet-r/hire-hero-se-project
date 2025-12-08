import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { askChatbot, axiosAuth, getChatHistory, clearChatHistory } from "../services/api";
import { Send, RotateCcw, Plus, Bot, User, Users, Briefcase, BarChart2, FileText, Sparkles, MessageSquare, ClipboardList, PenTool, CheckCircle } from "lucide-react";
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
  { tab: "performance", icon: FileText },
  { tab: "analytics", icon: BarChart2 },
];

const HRGenAI = ({ onNewChat }) => {
  const [activeTab, setActiveTab] = useState("genai"); // Main nav tab
  const [activeTool, setActiveTool] = useState("chatbot"); // GenAI tool tab
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "dashboard") {
      navigate("/dashboard-hr");
    }
  }, [activeTab, navigate]);

  return (
    <section className="min-h-screen flex bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter">
      <SidebarHR />
      <main className="flex-1 flex flex-col">
        <TopNavbarHR activeTab={activeTab} setActiveTab={setActiveTab} tabConfig={tabConfig} />

        {/* Tab Content */}
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "recruitment" && <RecruitmentTab />}
        {activeTab === "performance" && <Performance />}
        {activeTab === "analytics" && <Analytics fetchAnalyticsData={async () => ({metrics: {employeeSatisfaction: 90, turnoverRate: 8, avgSalary: 65000, trainingCompletion: 85}, workforceTrends: [], departmentBreakdown: []})} />}

        {/* GenAI Section */}
        {activeTab === "genai" && (
          <div className="p-8 flex flex-col gap-6 h-full">
            <h2 className="text-2xl font-extrabold text-[#013362] flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#005193]" /> HR GenAI Studio
            </h2>

            {/* Tools Navigation */}
            <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
                <ToolButton active={activeTool === "chatbot"} onClick={() => setActiveTool("chatbot")} icon={MessageSquare} label="AI Chatbot" />
                <ToolButton active={activeTool === "jd-gen"} onClick={() => setActiveTool("jd-gen")} icon={FileText} label="JD Generator" />
                <ToolButton active={activeTool === "interview-guide"} onClick={() => setActiveTool("interview-guide")} icon={ClipboardList} label="Interview Guide" />
                <ToolButton active={activeTool === "feedback-sum"} onClick={() => setActiveTool("feedback-sum")} icon={PenTool} label="Feedback Summarizer" />
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-auto">
                {activeTool === "chatbot" && <ChatbotTool onNewChat={onNewChat} />}
                {activeTool === "jd-gen" && <JDGeneratorTool />}
                {activeTool === "interview-guide" && <InterviewGuideTool />}
                {activeTool === "feedback-sum" && <FeedbackSummarizerTool />}
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

const ToolButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            active ? "bg-[#005193] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
        }`}
    >
        <Icon className="h-4 w-4" />
        {label}
    </button>
);

// --- Sub-Tools ---

const ChatbotTool = ({ onNewChat }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [botThinking, setBotThinking] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, botThinking]);

    const loadHistory = async () => {
        try {
            const history = await getChatHistory();
            if (history && history.length > 0) {
                setMessages(history);
            } else {
                setMessages([{ sender: "bot", text: "Hello! I am your HR GenAI Assistant. How may I help you?" }]);
            }
        } catch (err) {
            console.error("Failed to load chat history");
            setMessages([{ sender: "bot", text: "Hello! I am your HR GenAI Assistant. How may I help you?" }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setBotThinking(true);
        try {
            const data = await askChatbot(input);
            setBotThinking(false);
            const aiResponse = { sender: "bot", text: data.reply || "No response." };
            setMessages((prev) => [...prev, aiResponse]);
        } catch (err) {
            setBotThinking(false);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Sorry, I encountered an error. Please try again." }
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSend();
    };

    const startNewChat = async () => {
        if (!confirm("Are you sure you want to clear your chat history?")) return;
        try {
            await clearChatHistory();
            setMessages([{ sender: "bot", text: "New chat started! How may I assist you today?" }]);
            if (onNewChat) onNewChat();
        } catch (err) {
            alert("Failed to clear history");
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[600px]">
            <div className="flex justify-end mb-4">
                <button onClick={startNewChat} className="text-sm text-[#005193] font-semibold flex items-center gap-1 hover:underline">
                    <Plus className="h-4 w-4" /> New Session
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user" ? "bg-[#005193] text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}>
                            {msg.sender === "bot" && <Bot className="inline-block w-4 h-4 mr-2 mb-0.5" />}
                            {msg.text}
                        </div>
                    </div>
                ))}
                {botThinking && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-2 rounded-full animate-pulse">AI is thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#005193] outline-none"
                />
                <button onClick={handleSend} disabled={botThinking} className="bg-[#005193] text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const JDGeneratorTool = () => {
    const [formData, setFormData] = useState({ title: "", company_name: "" });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosAuth.post('/gen-ai/generate-jd', formData);
            setResult(res.data);
        } catch (err) {
            alert("Error generating JD");
        }
        setLoading(false);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 h-full">
            <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">Generate Job Description</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input className="w-full border border-gray-300 rounded-lg px-4 py-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input className="w-full border border-gray-300 rounded-lg px-4 py-2" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#005193] text-white py-2 rounded-lg font-semibold disabled:opacity-50">
                        {loading ? "Generating..." : "Generate JD"}
                    </button>
                </form>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-auto max-h-[600px]">
                {result ? (
                    <div className="prose text-sm text-gray-800">
                        <h4 className="font-bold text-lg mb-2">Generated Result:</h4>
                        <div className="whitespace-pre-wrap">{result.generated_description}</div>
                        {result.generated_responsibilities && (
                            <>
                                <h5 className="font-bold mt-4">Responsibilities:</h5>
                                <ul className="list-disc pl-5">
                                    {result.generated_responsibilities?.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </>
                        )}
                        {result.generated_qualifications && (
                            <>
                                <h5 className="font-bold mt-4">Qualifications:</h5>
                                <ul className="list-disc pl-5">
                                    {result.generated_qualifications?.map((q, i) => <li key={i}>{q}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20 flex flex-col items-center">
                        <FileText className="h-12 w-12 mb-2 opacity-20" />
                        Enter details to generate a JD
                    </div>
                )}
            </div>
        </div>
    );
};

const InterviewGuideTool = () => {
    const [jdText, setJdText] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!jdText) return;
        setLoading(true);
        try {
            const res = await axiosAuth.post('/gen-ai/generate-interview-guide', { job_description: jdText });
            setResult(res.data);
        } catch (err) { alert("Error"); }
        setLoading(false);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 h-full">
            <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">Generate Interview Guide</h3>
                <p className="text-xs text-gray-500 mb-2">Paste the Job Description below to get tailored questions.</p>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 h-64 focus:ring-2 focus:ring-[#005193] outline-none"
                    placeholder="Paste Job Description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                ></textarea>
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#005193] text-white py-2 rounded-lg font-semibold mt-4 disabled:opacity-50">
                    {loading ? "Generating..." : "Generate Guide"}
                </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-auto max-h-[600px]">
                {result ? (
                    <div className="space-y-4 text-sm text-gray-800">
                        <h4 className="font-bold text-lg border-b pb-2">Interview Guide: {result.job_title}</h4>
                        <div>
                            <h5 className="font-bold text-[#005193]">Behavioral Questions</h5>
                            {/* FIX: Default to empty array to prevent map error */}
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {(result.behavioral_questions || []).map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-[#005193]">Technical Questions</h5>
                            {/* FIX: Default to empty array to prevent map error */}
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {(result.technical_questions || []).map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-[#005193]">Scoring Rubric</h5>
                            <p className="whitespace-pre-wrap">{result.scoring_rubric}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20 flex flex-col items-center">
                        <ClipboardList className="h-12 w-12 mb-2 opacity-20" />
                        Paste JD to generate guide
                    </div>
                )}
            </div>
        </div>
    );
};

const FeedbackSummarizerTool = () => {
    const [notes, setNotes] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!notes) return;
        setLoading(true);
        try {
            const res = await axiosAuth.post('/gen-ai/summarize-feedback', { raw_feedback_notes: notes });
            setResult(res.data);
        } catch (err) { alert("Error"); }
        setLoading(false);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 h-full">
            <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">Summarize Interview Feedback</h3>
                <p className="text-xs text-gray-500 mb-2">Paste raw interview notes from multiple interviewers.</p>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 h-64 focus:ring-2 focus:ring-[#005193] outline-none"
                    placeholder="Interviewer 1: Good technical skills... Interviewer 2: Communication was weak..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#005193] text-white py-2 rounded-lg font-semibold mt-4 disabled:opacity-50">
                    {loading ? "Summarizing..." : "Summarize Feedback"}
                </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 overflow-auto max-h-[600px]">
                {result ? (
                    <div className="space-y-4 text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">Feedback Summary</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${result.recommendation.toLowerCase().includes('hire') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {result.recommendation}
                            </span>
                        </div>
                        <p className="italic text-gray-600">"{result.summary}"</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <h5 className="font-bold text-green-800 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Strengths</h5>
                                <ul className="list-disc pl-4 space-y-1">
                                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <h5 className="font-bold text-red-800 mb-2 flex items-center gap-1"><span className="text-lg leading-3">-</span> Weaknesses</h5>
                                <ul className="list-disc pl-4 space-y-1">
                                    {result.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20 flex flex-col items-center">
                        <PenTool className="h-12 w-12 mb-2 opacity-20" />
                        Paste notes to summarize
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRGenAI;
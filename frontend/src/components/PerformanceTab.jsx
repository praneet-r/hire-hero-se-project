import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { Star, User, Download, PlusCircle } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#facc15"];

import { getEmployees, getPerformanceInsights } from "../services/api";

const fetchPerformanceData = async () => {
  // Fetch employees from backend
  const employees = await getEmployees();
  const totalEmployees = employees.length;
  // Count remote and on-site workers by job_location or status
  const remoteWorkers = employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('remote')).length;
  const onSiteWorkers = employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('on-site') || (e.job_location || e.status || '').toLowerCase().includes('onsite')).length;
  // Calculate average performance if available (placeholder logic)
  const avgPerformance = employees.length ? Math.round(employees.reduce((sum, e) => sum + (e.performance || 80), 0) / employees.length) : 0;

  // Fetch AI Insights from backend
  let insights = [];
  try {
    insights = await getPerformanceInsights();
  } catch (e) {
    insights = [
      { title: "Top Performer", detail: "User_01 exceeded all goals by 25% this quarter." },
      { title: "Team Growth", detail: "Engineering team improved 18% this quarter." },
      { title: "Needs Support", detail: "3 employees showing performance decline." }
    ];
  }

  return {
    summary: {
      totalEmployees,
      remoteWorkers,
      onSiteWorkers,
      avgPerformance
    },
    performanceTrends: [
      { month: "Jan", performance: 80 },
      { month: "Feb", performance: 85 },
      { month: "Mar", performance: 90 },
      { month: "Apr", performance: 87 },
      { month: "May", performance: 92 }
    ],
    workforce: [
      { name: "Remote", value: remoteWorkers },
      { name: "On-site", value: onSiteWorkers }
    ],
    reviews: [
      { name: "User_01", role: "Frontend Dev", rating: 4.5, date: "Dec 15" },
      { name: "User_02", role: "Backend Dev", rating: 4.8, date: "Nov 10" }
    ],
    insights,
    goals: [
      { title: "Q1 Revenue Target", progress: 75 },
      { title: "Customer Satisfaction", progress: 82 },
      { title: "Training Completion", progress: 60 }
    ]
  };
};

const Performance = () => {
  const [data, setData] = useState({
    summary: {},
    performanceTrends: [],
    workforce: [],
    reviews: [],
    insights: [],
    goals: []
  });

  useEffect(() => {
    const loadData = async () => {
      let res = await fetchPerformanceData();
      setData(res);
    };
    loadData();
  }, []);

  const {
    summary,
    performanceTrends,
    workforce,
    reviews,
    insights,
    goals
  } = data;

  return (
  <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-[#013362]">Performance</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
          >
            <PlusCircle className="w-4 h-4" /> Start Review
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <SummaryCard label="Total Employees" value={summary.totalEmployees} icon={User} />
        <SummaryCard label="Remote Workers" value={summary.remoteWorkers} icon={User} />
        <SummaryCard label="On-Site Workers" value={summary.onSiteWorkers} icon={User} />
        <SummaryCard label="Avg Performance" value={`${summary.avgPerformance}%`} icon={Star} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-bold text-[#013362] flex items-center gap-2">Performance Trends</h3>
            <select className="bg-transparent border rounded-lg px-2 py-1 text-sm text-gray-800">
              <option>6m</option>
              <option>1y</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="performance" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-[#013362]">Workforce Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={workforce} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {workforce.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights, Reviews, Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-[#013362]">AI Insights</h3>
          {insights.map((ins, idx) => (
            <div key={idx} className="border-l-4 border-indigo-500 pl-3 text-sm">
              <p className="font-semibold">{ins.title}</p>
              <p className="text-gray-600">{ins.detail}</p>
            </div>
          ))}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-[#013362]">Recent Reviews</h3>
          {reviews.map((r, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold">{r.rating}</span>
                <span className="text-xs text-gray-400 ml-1">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-[#013362]">Goal Progress</h3>
          {goals.map((g, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm">
                <span>{g.title}</span>
                <span>{g.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${g.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Small reusable summary card
const SummaryCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center flex flex-col items-center">
    {Icon && <Icon className="h-7 w-7 mb-2 text-[#005193]" />}
    <h3 className="text-3xl font-extrabold text-[#013362]">{value ?? "—"}</h3>
    <p className="text-gray-500 mt-1 text-sm font-medium">{label}</p>
  </div>
);

export default Performance;

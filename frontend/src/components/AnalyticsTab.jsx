import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend
} from "recharts";
import { RefreshCcw, Brain } from "lucide-react";


const fetchAnalyticsData = async () => {
  // Replace with your backend API
  return {
      metrics: {
        employeeSatisfaction: 85,
        turnoverRate: 12,
        avgSalary: 75000,
        trainingCompletion: 90
      },
      workforceTrends: [
        { month: "Jan", headcount: 240, turnover: 15, satisfaction: 80 },
        { month: "Feb", headcount: 250, turnover: 14, satisfaction: 82 },
        { month: "Mar", headcount: 260, turnover: 12, satisfaction: 85 },
        { month: "Apr", headcount: 265, turnover: 10, satisfaction: 87 },
        { month: "May", headcount: 270, turnover: 9, satisfaction: 89 }
      ],
      departmentBreakdown: [
        { department: "Q1", engineering: 120, marketing: 80, design: 40 },
        { department: "Q2", engineering: 130, marketing: 85, design: 45 },
        { department: "Q3", engineering: 140, marketing: 88, design: 50 }
      ]
    };
};

const Analytics = () => {
  const [data, setData] = useState({
    metrics: {},
    workforceTrends: [],
    departmentBreakdown: []
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetchAnalyticsData();
      setData(res);
    };
    load();
  }, []);

  const { metrics, workforceTrends, departmentBreakdown } = data;

  return (
  <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-[#013362]">Analytics</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
          >
            <Brain className="w-4 h-4" /> AI Analysis
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-6">
        <MetricCard label="Employee Satisfaction" value={`${metrics.employeeSatisfaction}%`} />
        <MetricCard label="Turnover Rate" value={`${metrics.turnoverRate}%`} />
        <MetricCard label="Avg Salary" value={`$${metrics.avgSalary}`} />
        <MetricCard label="Training Completion" value={`${metrics.trainingCompletion}%`} />
      </div>

      {/* Workforce Trends + Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workforce Trends */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-bold text-[#013362] flex items-center gap-2">Workforce Trends</h3>
            <div className="flex gap-2">
              <span className="text-xs border rounded-lg px-2 py-1 bg-indigo-50 text-indigo-600">Headcount</span>
              <span className="text-xs border rounded-lg px-2 py-1">Turnover</span>
              <span className="text-xs border rounded-lg px-2 py-1">Satisfaction</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={workforceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="headcount" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="turnover" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-[#013362]">Department Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="engineering" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="marketing" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="design" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center flex flex-col items-center">
    <h3 className="text-3xl font-extrabold text-[#013362]">{value ?? "—"}</h3>
    <p className="text-gray-500 mt-1 text-sm font-medium">{label}</p>
  </div>
);

export default Analytics;

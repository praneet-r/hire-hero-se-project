import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { Star, User, Download, Activity } from "lucide-react";
import { getEmployees, getPerformanceInsights } from "../services/api";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

const Performance = () => {
  const [data, setData] = useState({
    summary: { total: 0, remote: 0, hybrid: 0, onsite: 0, avg: 0, totalReviews: 0 },
    performanceTrends: [],
    workforce: [],
    reviews: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const employees = await getEmployees();
            
            // 1. Core Summary Stats
            const total = employees.length;
            
            // Refined Workforce Logic
            let remote = 0;
            let hybrid = 0;
            let onsite = 0;

            employees.forEach(e => {
                const loc = (e.job_location || '').toLowerCase();
                if (loc.includes('remote')) {
                    remote++;
                } else if (loc.includes('hybrid')) {
                    hybrid++;
                } else {
                    onsite++;
                }
            });
            
            // Calculate Global Average
            const validAvgScores = employees.map(e => e.performance_avg).filter(s => s > 0);
            const avg = validAvgScores.length 
                ? (validAvgScores.reduce((a, b) => a + b, 0) / validAvgScores.length).toFixed(1) 
                : 0;

            // 2. Aggregate Reviews
            let allReviews = [];
            employees.forEach(e => {
                if (e.performances) {
                    e.performances.forEach(p => {
                        allReviews.push({ ...p, employeeName: e.name });
                    });
                }
            });

            // Capture Total Count BEFORE slicing
            const totalReviews = allReviews.length;

            // Sort by date asc for trends
            allReviews.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Group by Month for Trend Chart
            const trendMap = {};
            allReviews.forEach(r => {
                const month = new Date(r.date).toLocaleString('default', { month: 'short' });
                if (!trendMap[month]) trendMap[month] = { sum: 0, count: 0 };
                trendMap[month].sum += r.rating;
                trendMap[month].count += 1;
            });

            const performanceTrends = Object.keys(trendMap).map(m => ({
                month: m,
                rating: parseFloat((trendMap[m].sum / trendMap[m].count).toFixed(1))
            }));

            // Recent Reviews List (Top 5 most recent) - Reverse sort by date
            const recentReviews = [...allReviews].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            // 4. Workforce Distribution Data
            // FIX: Assign specific colors here BEFORE filtering
            const workforce = [
                { name: "Remote", value: remote, color: COLORS[0] },
                { name: "Hybrid", value: hybrid, color: COLORS[1] },
                { name: "On-site", value: onsite, color: COLORS[2] }
            ].filter(item => item.value > 0); 

            // 5. Insights
            let insights = [];
            try {
                insights = await getPerformanceInsights(); 
            } catch {
                insights = [{ title: "Data Loaded", detail: "Real performance data loaded successfully." }];
            }

            setData({
                summary: { total, remote, hybrid, onsite, avg, totalReviews },
                performanceTrends,
                workforce,
                reviews: recentReviews,
                insights
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading performance analytics...</div>;

  const { summary, performanceTrends, workforce, reviews, insights } = data;

  return (
  <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-[#013362]">Performance Analytics</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-300 shadow-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SummaryCard label="Total Employees" value={summary.total} icon={User} />
        <SummaryCard label="Avg Rating" value={summary.avg} icon={Star} color="text-yellow-500" />
        <SummaryCard label="Total Reviews" value={summary.totalReviews} icon={Activity} />
        <SummaryCard label="Remote / Hybrid" value={`${summary.remote} / ${summary.hybrid}`} icon={User} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#013362] mb-4">Performance Trends (Avg Rating)</h3>
          {performanceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">Not enough data yet.</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-[#013362]">Workforce Split</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={workforce} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5}
              >
                {/* FIX: Use entry.color instead of index-based color */}
                {workforce.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></div> 
                  Remote
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }}></div> 
                  Hybrid
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[2] }}></div> 
                  On-site
              </div>
          </div>
        </div>
      </div>

      {/* Reviews & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#013362]">Recent Reviews</h3>
          {reviews.length > 0 ? reviews.map((r, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#005193] font-bold text-sm">
                    {r.employeeName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{r.employeeName}</p>
                  <p className="text-sm text-gray-600 italic">"{r.comments}"</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-yellow-500 font-bold">
                    {r.rating} <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
              </div>
            </div>
          )) : <div className="text-gray-500 italic">No reviews submitted yet.</div>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#013362]">AI Insights</h3>
          {insights.map((ins, idx) => (
            <div key={idx} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <p className="font-bold text-indigo-900 text-sm mb-1">{ins.title}</p>
              <p className="text-indigo-700 text-xs leading-relaxed">{ins.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color = "text-[#005193]" }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center flex flex-col items-center">
    {Icon && <Icon className={`h-8 w-8 mb-2 ${color}`} />}
    <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
    <p className="text-gray-500 mt-1 text-sm font-medium uppercase tracking-wide">{label}</p>
  </div>
);

export default Performance;
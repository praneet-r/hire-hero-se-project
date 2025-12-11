import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { getEmployees, getMyJobs, getCompanyApplications } from "../services/api";
import { Download, Sparkles, AlertCircle, Users, Plus, Briefcase, FileText, BarChart2, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RecruitmentTab from "../components/RecruitmentTab";
import EmployeesTab from "../components/EmployeesTab";
import PerformanceTab from "../components/PerformanceTab";
import AnalyticsTab from "../components/AnalyticsTab";
import ProfileHR from "../components/ProfileHR";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";

export default function DashboardHR() {
    const location = useLocation(); 
    const [activeTab, setActiveTab] = useState("dashboard");
    const [username, setUsername] = useState("");
    
    // Updated Metrics State
    const [metrics, setMetrics] = useState({
      totalEmployees: 0,
      newHires: 0,
      openPositions: 0,
      pipelineConversion: 0,
    });

    const [qualityDistribution, setQualityDistribution] = useState([]);
    const [actionItems, setActionItems] = useState([]);

    // Check for incoming tab state on mount
    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    // Fetch Username
    useEffect(() => {
      async function fetchUsername() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.first_name || data.last_name) {
              setUsername(`${data.first_name || ''} ${data.last_name || ''}`.trim());
            } else {
              setUsername(data.username || data.email || "User");
            }
          }
        } catch (err) {
          setUsername("User");
        }
      }
      fetchUsername();
    }, []);

    // Main Data Fetch Effect
    useEffect(() => {
      async function fetchData() {
        try {
          const [employees, myJobs, applications] = await Promise.all([
            getEmployees(),
            getMyJobs(),
            getCompanyApplications(),
          ]);

          // --- Filter Applications for Current HR's Jobs ---
          const myJobIds = new Set(myJobs.map(j => j.id));
          const myApps = applications.filter(app => myJobIds.has(app.job_id));

          // 1. Calculate Core Metrics
          const totalEmployees = employees.length;
          const openPositions = myJobs.filter(j => !j.status || j.status.toLowerCase() === 'open').length;
          const newHires = myApps.filter(app => ['hired', 'accepted'].includes(app.status)).length;

          // Pipeline Conversion: (Interviewing + Offer + Hired) / Total Apps
          const funnelSteps = new Set(['interviewing', 'under_review', 'offer_extended', 'accepted', 'hired']);
          const converted = myApps.filter(app => funnelSteps.has(app.status)).length;
          const pipelineConversion = myApps.length > 0 ? Math.round((converted / myApps.length) * 100) : 0;

          setMetrics({
            totalEmployees,
            newHires,
            openPositions,
            pipelineConversion,
          });

          // 2. Candidate Quality Distribution (Bar Chart)
          const buckets = [
            { name: 'Low Match (0-49%)', range: [0, 49], count: 0, color: '#EF4444' },     // Red
            { name: 'Potential (50-79%)', range: [50, 79], count: 0, color: '#F59E0B' },   // Yellow
            { name: 'Top Talent (80%+)', range: [80, 100], count: 0, color: '#10B981' }, // Green
          ];

          myApps.forEach(app => {
            const score = app.match_score || 0;
            if (score >= 80) buckets[2].count++;
            else if (score >= 50) buckets[1].count++;
            else buckets[0].count++;
          });
          setQualityDistribution(buckets);

          // 3. Smart Action Items
          const actions = [];

          // Alert: High Match Candidates Pending Review
          const pendingHighMatch = myApps.filter(app => app.status === 'applied' && (app.match_score || 0) >= 80).length;
          if (pendingHighMatch > 0) {
            actions.push({
              type: 'urgent',
              title: 'Top Talent Waiting',
              desc: `${pendingHighMatch} candidates with >80% match score are waiting for review.`
            });
          }

          // Alert: Active Interviews
          const activeInterviews = myApps.filter(app => app.status === 'interviewing').length;
          if (activeInterviews > 0) {
            actions.push({
              type: 'info',
              title: 'Interview Stage',
              desc: `You have ${activeInterviews} candidates currently in the interview stage.`
            });
          }

          // Alert: New Applications (Last 24h)
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          const newApps = myApps.filter(app => new Date(app.applied_at) > oneDayAgo).length;
          if (newApps > 0) {
            actions.push({
              type: 'success',
              title: 'New Applications',
              desc: `${newApps} new applications received in the last 24 hours.`
            });
          }

          if (actions.length === 0) {
            actions.push({ type: 'neutral', title: 'All Caught Up', desc: 'No urgent items requiring attention right now.' });
          }

          setActionItems(actions);

        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        }
      }
      fetchData();
    }, []);

  return (
    <section className="min-h-screen flex bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter">
      <SidebarHR />
      <main className="flex-1 flex flex-col">
        <TopNavbarHR
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          tabConfig={[
            { tab: "dashboard", icon: BarChart2 },
            { tab: "employees", icon: Users },
            { tab: "recruitment", icon: Briefcase },
            { tab: "performance", icon: FileText },
            { tab: "analytics", icon: BarChart2 },
          ]}
        />

        {/* Dashboard Content - Tabs */}
        <div className="p-8 flex flex-col gap-6">
          {activeTab === "dashboard" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-[#013362]">
                  Welcome, <span className="font-semibold">{username || "User"}</span>
                </h1>
                <button
                  className="bg-gradient-to-r from-[#013362] to-[#005193] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 hover:opacity-90"
                  onClick={() => alert("Export feature coming soon!")}
                >
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: "Total Employees", value: metrics.totalEmployees, icon: Users },
                  { label: "New Hires (My Jobs)", value: metrics.newHires, icon: Plus },
                  { label: "Open Positions", value: metrics.openPositions, icon: Briefcase },
                  { label: "Pipeline Conversion", value: `${metrics.pipelineConversion}%`, icon: TrendingUp },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center hover:shadow-md transition flex flex-col items-center"
                  >
                    <item.icon className="h-7 w-7 mb-2 text-[#005193]" />
                    <h3 className="text-3xl font-extrabold text-[#013362]">{item.value}</h3>
                    <p className="text-gray-500 mt-1 text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Data Visualization Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Candidate Quality Distribution Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
                  <h2 className="text-lg font-bold text-[#013362] mb-6 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-[#005193]" /> Candidate Quality Distribution
                  </h2>
                  <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qualityDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#4B5563', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        />
                        <Tooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                          {qualityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Smart Action Items */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#005193]" /> Smart Action Items
                  </h2>
                  <div className="space-y-4">
                    {actionItems.map((action, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:bg-gray-50 transition">
                        {action.type === 'urgent' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />}
                        {action.type === 'info' && <Calendar className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />}
                        {action.type === 'success' && <Sparkles className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />}
                        {action.type === 'neutral' && <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-bold text-[#013362] text-sm">{action.title}</p>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-400">
                      Insights generated based on real-time data
                    </p>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Feature Tabs */}
          {activeTab === "employees" && <EmployeesTab />}
          {activeTab === "recruitment" && <RecruitmentTab />}
          {activeTab === "performance" && <PerformanceTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "profile" && <ProfileHR />}
        </div>
      </main>
    </section>
  );
}
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Added useLocation
import { getEmployees, getJobs, getCompanyApplications, getCandidates } from "../services/api";
import { Download, Sparkles, AlertCircle, BookOpen, Users, Plus, Briefcase, FileText, User, BarChart2, Mail, Phone } from "lucide-react";
import RecruitmentTab from "../components/RecruitmentTab";
import EmployeesTab from "../components/EmployeesTab";
import PerformanceTab from "../components/PerformanceTab";
import AnalyticsTab from "../components/AnalyticsTab";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";


export default function DashboardHR() {
    const location = useLocation(); // Hook to access state passed via navigate
    const [activeTab, setActiveTab] = useState("dashboard");
    const [username, setUsername] = useState("");
    const [metrics, setMetrics] = useState({
      totalEmployees: 0,
      newHires: 0,
      openPositions: 0,
      aiEfficiency: 0,
    });
    
    // Check for incoming tab state on mount
    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const [resumeScreening, setResumeScreening] = useState([]);
    useEffect(() => {
      async function fetchResumeScreening() {
        try {
          const profiles = await getCandidates();
          // Mock AI match: random or based on completeness (if available, otherwise random)
          const aiProfiles = profiles.map(p => {
            let fullName = '';
            if (p.first_name && p.last_name) {
              fullName = `${p.first_name} ${p.last_name}`.trim();
            } else if (p.first_name) {
              fullName = p.first_name;
            } else if (p.last_name) {
              fullName = p.last_name;
            } else {
              fullName = p.email;
            }
            return {
              name: fullName,
              email: p.email || '',
              phone: p.phone || '',
              role: 'Candidate', // getCandidates returns basic info
              match: `${Math.floor(Math.random()*21)+80}%`,
            };
          });
          // Sort by match descending, take top 3
          aiProfiles.sort((a, b) => parseInt(b.match) - parseInt(a.match));
          setResumeScreening(aiProfiles.slice(0, 3));
        } catch (err) {
          setResumeScreening([]);
        }
      }
      fetchResumeScreening();
    }, []);

    useEffect(() => {
      async function fetchUsername() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            // Prefer first_name + last_name, fallback to username/email
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

    useEffect(() => {
      async function fetchMetrics() {
        try {
          const [employees, jobs, applications] = await Promise.all([
            getEmployees(),
            getJobs(),
            getCompanyApplications(),
          ]);
          // Example logic for metrics
          const totalEmployees = employees.length;
          // New hires: employees created in last 30 days
          const now = new Date();
          const newHires = employees.filter(e => {
            if (!e.created_at) return false;
            const created = new Date(e.created_at);
            return (now - created) / (1000 * 60 * 60 * 24) <= 30;
          }).length;
          // Open positions: jobs where status is 'open' or similar
          const openPositions = jobs.filter(j => j.status === 'open' || j.status === 'Open').length || jobs.length;
          // AI Efficiency: placeholder, could be calculated from analytics
          const aiEfficiency = 92; // TODO: Replace with real value if available
          setMetrics({
            totalEmployees,
            newHires,
            openPositions,
            aiEfficiency,
          });
        } catch (err) {
          // fallback to 0s
          setMetrics({ totalEmployees: 0, newHires: 0, openPositions: 0, aiEfficiency: 0 });
        }
      }
      fetchMetrics();
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
                  { label: "New Hires", value: metrics.newHires, icon: Plus },
                  { label: "Open Positions", value: metrics.openPositions, icon: Briefcase },
                  { label: "AI Efficiency", value: `${metrics.aiEfficiency}%`, icon: Sparkles },
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

              {/* Resume Screening + AI Insights */}
              <div className="grid grid-cols-3 gap-6">
                {/* AI Resume Screening */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#013362] flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#005193]" /> AI Resume Screening
                    </h2>
                    <button className="text-[#005193] text-sm font-semibold hover:underline flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resumeScreening.length === 0 ? (
                      <div className="text-gray-400 text-center py-4">No profiles found.</div>
                    ) : (
                      resumeScreening.map((user, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3 hover:bg-[#F7F8FF] transition"
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-[#005193]" />
                            <div>
                              <p className="font-medium text-gray-800">{user.name}</p>
                              {user.role && <p className="text-sm text-gray-600">{user.role}</p>}
                              <div className="flex items-center gap-2 mt-1">
                                {user.email && (
                                  <span className="flex items-center text-xs text-gray-600"><Mail className="h-3 w-3 mr-1" />{user.email}</span>
                                )}
                                {user.phone && (
                                  <span className="flex items-center text-xs text-gray-600"><Phone className="h-3 w-3 mr-1" />{user.phone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-[#005193]">{user.match} match</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#005193]" /> AI Insights
                  </h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-[#f59e0b] mt-1" />
                      <div>
                        <p className="font-semibold text-[#005193]">Retention Alert</p>
                        <p className="text-sm text-gray-600 mt-1">
                          3 high-performers at risk of leaving. Consider retention strategies.
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-[#005193] mt-1" />
                      <div>
                        <p className="font-semibold text-[#005193]">Training Due</p>
                        <p className="text-sm text-gray-600 mt-1">
                          12 employees need compliance training by November 2025.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Employees Feature Tab */}
          {activeTab === "employees" && <EmployeesTab />}
          {activeTab === "recruitment" && <RecruitmentTab />}
          {activeTab === "performance" && <PerformanceTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </main>
    </section>
  );
}
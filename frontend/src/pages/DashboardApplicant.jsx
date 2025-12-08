import React from 'react';
import { getJobs, getApplications, getMyInterviews } from '../services/api';
import TopNavbarApplicant from "../components/TopNavbarApplicant";
import JobSearch from '../components/JobSearch';
import MyApplications from '../components/MyApplications';
import Chatbot from '../components/Chatbot';
import ProfileApplicant from '../components/ProfileApplicant';
import { Briefcase, Send, Eye, Users, Sparkles, FileText, User, BarChart2, Download, Mail, Calendar, UserCheck } from "lucide-react";

export default function DashboardApplicant() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [username, setUsername] = React.useState("");
  const [stats, setStats] = React.useState([
    { label: "Applications Sent", value: 0, sub: "", icon: Send },
    { label: "Profile Views", value: 0, sub: "", icon: Eye },
    { label: "Interview Requests", value: 0, sub: "", icon: Briefcase },
    { label: "AI Job Match", value: "0%", sub: "", icon: Sparkles },
  ]);
  const [recommendedJobs, setRecommendedJobs] = React.useState([]);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      // Fetch username
      const token = localStorage.getItem('token');
      if (token) {
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
        } catch {
          setUsername("User");
        }
      }
      // Fetch upcoming interviews
      try {
        const interviews = await getMyInterviews();
        
        setUpcomingInterviews(interviews.map(interview => ({
          id: interview.id,
          company: interview.company_name || "HireHero",
          role: interview.job_title || "Interview",
          date: new Date(interview.scheduled_at).toLocaleDateString(),
          time: new Date(interview.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          link: interview.location_detail,
          type: interview.location_type || 'video' // <--- Added: capture the type (video, phone, in_person)
        })));
        
        // Update Stats based on real interviews
        setStats(prev => prev.map(stat =>
          stat.label === "Interview Requests"
            ? { ...stat, value: interviews.length, sub: "Scheduled" }
            : stat
        ));
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setUpcomingInterviews([]);
      }
      // Fetch applications
      try {
        const applications = await getApplications();
        setStats(prev => prev.map(stat =>
          stat.label === "Applications Sent"
            ? { ...stat, value: applications.length, sub: `+${applications.length} total` }
            : stat
        ));
        setRecentActivity(applications.map(app => ({
          icon: Send,
          color: "#005193",
          text: `Applied for ${app.title || 'Job'} at ${app.company || 'Company'}`, 
          time: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "recently"
        })));
      } catch {}
      // Fetch jobs
      try {
        const jobs = await getJobs();
        setRecommendedJobs(jobs.slice(0, 2)); // Show top 2 jobs
        setStats(prev => prev.map(stat =>
          stat.label === "AI Job Match"
            ? { ...stat, value: `${jobs.length * 10}%`, sub: "example match" }
            : stat
        ));
      } catch {}
    }
    fetchData();
  }, []);

  // ...existing code...

  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter">
      <TopNavbarApplicant activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 flex flex-col gap-6">
  {activeTab === "dashboard" && (
          <>
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-extrabold text-[#013362]">
                  Welcome, <span className="font-semibold">{username || "User"}</span>
              </h1>
            </div>
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center hover:shadow-md transition flex flex-col items-center"
                >
                  {stat.icon && <stat.icon className="h-7 w-7 mb-2 text-[#005193]" />}
                  <h3 className="text-3xl font-extrabold text-[#013362]">{stat.value}</h3>
                  <p className="text-gray-500 mt-1 text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>
            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AI Recommended Jobs */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-[#013362] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#005193]" /> AI Recommended Jobs
                  </h2>
                  <button className="text-[#005193] text-sm font-semibold hover:underline flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" /> View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recommendedJobs.map((job, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start border border-gray-200 rounded-lg px-4 py-3 hover:bg-[#F7F8FF] transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold uppercase text-gray-600">
                            {(job.company_name || job.company || "C")[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{job.title}</p>
                            <p className="text-sm text-gray-500">{job.company_name || job.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(Array.isArray(job.tags) ? job.tags : typeof job.tags === 'string' ? job.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                              style={{ marginBottom: '2px' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button className="px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 text-[#005193] hover:underline bg-transparent border-none shadow-none">
                          View Details
                        </button>
                        <button className="px-5 py-2 rounded-md text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white shadow-lg hover:opacity-90 transition">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#005193]" /> Recent Activity
                </h2>
                <ul className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 mt-1" style={{ color: item.color }} />
                      <div>
                        <p className="text-sm text-gray-800">{item.text}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#005193]" /> Upcoming Interviews
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingInterviews.length > 0 ? upcomingInterviews.map((interview, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-[#F7F8FF]"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{interview.company}</p>
                      <p className="text-sm text-gray-500 capitalize">{interview.role}</p>
                      <p className="text-xs text-[#005193] font-semibold mt-1">
                        {interview.date} at {interview.time}
                      </p>
                    </div>
                    
                    {/* UPDATED ACTION SECTION */}
                    <div className="flex space-x-2 mt-3 md:mt-0 items-center">
                      {interview.type === 'video' ? (
                        <button 
                          onClick={() => window.open(interview.link, '_blank')}
                          disabled={!interview.link}
                          className="px-5 py-2 rounded-md text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white shadow-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                          Join Interview
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-500 uppercase block mb-1">
                            {interview.type === 'phone' ? 'Phone Call' : 'In Person'}
                          </span>
                          <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md block max-w-[200px] truncate" title={interview.link}>
                            {interview.link || 'Location pending'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm italic">No upcoming interviews scheduled.</p>
                )}
              </div>
            </div>
          </>
        )}
        {/* Tab content for other tabs */}
        {activeTab === "jobs" && <JobSearch />}
        {activeTab === "applications" && <MyApplications />}
        {activeTab === "profile" && <ProfileApplicant />}
        {activeTab === "chat" && <Chatbot />}
      </main>
    </section>
  );
};


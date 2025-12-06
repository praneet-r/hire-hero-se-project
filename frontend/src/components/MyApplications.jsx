import React, { useState, useEffect } from "react";
import { getApplications } from '../services/api';
import { Calendar, Trash2 } from "lucide-react";

const MyApplications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [applications, setApplications] = useState([]);
  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch {}
    }
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const title = typeof app.title === 'string' ? app.title : '';
    const status = typeof app.status === 'string' ? app.status : '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] text-[#013362]">
      {/* ---------- Page Header ---------- */}
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">My Applications</h1>

      {/* ---------- Summary Cards ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#013362]">{applications.length}</h2>
          <p className="text-gray-500 text-sm font-medium">Total Applications</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#013362]">{applications.filter(app => app.status && (app.status.toLowerCase().includes('interview') || app.status === 'interviewing')).length}</h2>
          <p className="text-gray-500 text-sm font-medium">Interviews</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#013362]">{applications.filter(app => app.status && (app.status.toLowerCase().includes('offer') || app.status === 'offer_extended')).length}</h2>
          <p className="text-gray-500 text-sm font-medium">Offers</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#013362]">{applications.filter(app => app.status && app.status.toLowerCase().includes('reject')).length}</h2>
          <p className="text-gray-500 text-sm font-medium">Rejected</p>
        </div>
      </div>

      {/* ---------- Application Pipeline Header ---------- */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="font-bold text-xl text-[#013362]">Application Pipeline</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-blue-50 border-none rounded-full px-5 py-3 min-w-[200px] text-[#013362] placeholder:text-[#013362] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#013362]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-blue-50 border-none rounded-full px-5 py-3 text-[#013362] text-sm shadow-sm focus:ring-2 focus:ring-[#013362]"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer_extended">Offer Extended</option>
            <option value="under_review">Under Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ---------- Application List ---------- */}
      <div className="space-y-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-2xl border border-blue-100 shadow p-6 hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-wrap items-center w-full justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <h4 className="font-extrabold text-2xl text-[#013362] leading-tight truncate">{app.title}</h4>
                                    <span className="inline-block mt-1 bg-white border border-blue-200 text-[#005193] text-sm font-extrabold rounded-full px-4 py-2 tracking-wide shadow-sm transition-all align-middle w-fit">HireHero</span>
                  {/* <span className="inline-block mt-1 bg-white border border-blue-200 text-[#005193] text-sm font-extrabold rounded-full px-4 py-2 tracking-wide shadow-sm transition-all align-middle w-fit">{app.company}</span> */}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 text-[#005193] hover:underline bg-transparent border-none shadow-none transition">
                    View Details
                  </button>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-semibold shadow-sm transition-all ${
                      app.status === "offer_extended" || app.status === "offer received"
                        ? "bg-blue-100 text-blue-700"
                        : app.status === "interviewing" || app.status === "interview scheduled"
                        ? "bg-green-100 text-green-700"
                        : app.status === "under_review" || app.status === "under review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {app.status}
                  </span>
                  <button title="Calendar" className="hover:text-[#005193] transition">
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button title="Delete" className="hover:text-red-500 transition">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              {(Array.isArray(app.tags) ? app.tags : typeof app.tags === 'string' ? app.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 items-end sm:items-center justify-between">
              {/* ...existing code... (row removed, now handled above) */}
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No applications found.
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
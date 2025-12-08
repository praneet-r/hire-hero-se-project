import React, { useState, useEffect } from "react";
import { getJobs, applyToJob } from '../services/api';

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");

  const [jobs, setJobs] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [applyStatus, setApplyStatus] = useState({}); // { [jobId]: 'success' | 'error' }
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setApplyStatus((prev) => ({ ...prev, [jobId]: undefined }));
    try {
      await applyToJob(jobId);
      setApplyStatus((prev) => ({ ...prev, [jobId]: 'success' }));
      setStatus({ msg: 'Applied!', type: 'success' });
    } catch (err) {
      setApplyStatus((prev) => ({ ...prev, [jobId]: 'error' }));
      setStatus({ msg: 'Error. Try again.', type: 'error' });
    }
    setApplyingId(null);
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };
  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch {}
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] text-[#013362]">
      {/* ---------- Page Header ---------- */}
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Find Your Next Job</h1>

      {/* ---------- Filters Row ---------- */}
      <div className="bg-white/80 shadow rounded-2xl p-5 flex flex-wrap gap-3 md:gap-4 items-center border border-blue-100">
        <input
          type="text"
          placeholder="Job title, keywords or company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-blue-50 border-none rounded-full px-5 py-3 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#013362] text-[#013362] placeholder:text-[#013362] text-sm shadow-sm"
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-blue-50 border-none rounded-full px-5 py-3 text-[#013362] focus:ring-2 focus:ring-[#013362] text-sm shadow-sm"
        >
          <option value="all">All Locations</option>
          <option value="remote">Remote</option>
          <option value="india">India</option>
          <option value="usa">USA</option>
        </select>

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="bg-blue-50 border-none rounded-full px-5 py-3 text-[#013362] focus:ring-2 focus:ring-[#013362] text-sm shadow-sm"
        >
          <option value="all">All Types</option>
          <option value="fulltime">Full-time</option>
          <option value="parttime">Part-time</option>
          <option value="contract">Contract</option>
        </select>

        <div className="flex gap-2 ml-auto mt-2 md:mt-0">
          <button className="px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white shadow-lg hover:opacity-90 transition">
            Search Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-8">
        {/* ---------- Sidebar Filters ---------- */}
  <aside className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-xl text-[#013362] leading-tight mb-3">Quick Filters</h3>

          <div className="mb-5">
            <h4 className="font-bold mb-1 text-base">Experience Level</h4>
            <ul className="text-sm space-y-1">
              <li><input type="checkbox" /> Entry Level (15)</li>
              <li><input type="checkbox" /> Mid Level (42)</li>
              <li><input type="checkbox" /> Senior Level (28)</li>
            </ul>
          </div>

          <div className="mb-5">
            <h4 className="font-bold mb-1 text-base">Salary Range</h4>
            <ul className="text-sm space-y-1">
              <li><input type="checkbox" /> ₹30k - ₹50k (12)</li>
              <li><input type="checkbox" /> ₹50k - ₹80k (35)</li>
              <li><input type="checkbox" /> ₹80k+ (8)</li>
            </ul>
          </div>

          <div className="mb-5">
            <h4 className="font-bold mb-1 text-base">Company Size</h4>
            <ul className="text-sm space-y-1">
              <li><input type="checkbox" /> Startup (1–50)</li>
              <li><input type="checkbox" /> Mid-size (51–500)</li>
              <li><input type="checkbox" /> Enterprise (500+)</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className="font-bold text-xl text-[#013362] leading-tight mb-2">AI Job Alert</h3>
            <p className="text-sm mb-3">
              Get notified when jobs matching your profile are posted.
            </p>
            <button className="w-full bg-gradient-to-r from-[#005193] to-[#013362] text-white rounded-md px-5 py-2 font-semibold shadow-lg hover:opacity-90 transition">
              Create Alert
            </button>
          </div>
        </aside>

        {/* ---------- Job Listings ---------- */}
        <main className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-blue-100 shadow p-6 hover:shadow-lg transition flex flex-col gap-2"
            >

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-2xl text-[#013362] leading-tight mb-2">{job.title}</h4>
                  <span className="inline-block mt-1 bg-white border border-blue-200 text-[#005193] text-sm font-extrabold rounded-full px-4 py-1.5 tracking-wide shadow-sm transition-all">{job.company}</span>
                </div>
              </div>


              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">₹ {job.salary}</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">{job.type}</span>
              </div>


              <div className="flex flex-wrap gap-2 mb-4">
                {(Array.isArray(job.tags) ? job.tags : typeof job.tags === 'string' ? job.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 items-end sm:items-center">
                <button
                  className="px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 text-[#005193] hover:underline bg-transparent border-none shadow-none transition"
                  onClick={() => setSelectedJob(job)}
                >
                  View Details
                </button>
                <button
                  className="px-5 py-2 rounded-md text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white shadow-lg hover:opacity-90 transition disabled:opacity-60"
                  onClick={() => handleApply(job.id)}
                  disabled={applyingId === job.id}
                >
                  {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                </button>
                {/* Inline feedback removed, now handled by status pill */}
                    {/* Status Pill */}
                    {status.msg && (
                      <div
                        style={{
                          position: 'fixed',
                          left: '50%',
                          bottom: 40,
                          transform: 'translateX(-50%)',
                          zIndex: 1000,
                          minWidth: 200,
                          padding: '12px 32px',
                          borderRadius: 9999,
                          fontWeight: 600,
                          textAlign: 'center',
                          background: status.type === 'success'
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : status.type === 'error'
                            ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                            : 'linear-gradient(90deg, #60a5fa, #6366f1)',
                          color: '#fff',
                          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
                          fontSize: 16,
                        }}
                      >
                        {status.msg}
                      </div>
                    )}
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#013362]">{selectedJob.title}</h3>
                  <p className="text-sm text-gray-500 font-semibold">{selectedJob.company_name || selectedJob.company || "HireHero"}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-blue-50 text-[#005193] px-3 py-1 rounded-full text-xs font-semibold">{selectedJob.type || selectedJob.employmentType || "Full-time"}</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{selectedJob.salary || "Competitive"}</span>
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{selectedJob.location || "Remote"}</span>
              </div>

              <div className="prose text-sm text-gray-700 mb-6">
                <h4 className="font-bold text-[#013362] mb-2">Description</h4>
                <p className="whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-[#013362] mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedJob.tags) ? selectedJob.tags : typeof selectedJob.tags === 'string' ? selectedJob.tags.split(',') : []).map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setSelectedJob(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Close</button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50"
                  onClick={() => { handleApply(selectedJob.id); setSelectedJob(null); }}
                  disabled={applyingId === selectedJob.id}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSearch;
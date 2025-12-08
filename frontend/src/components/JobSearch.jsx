import React, { useState, useEffect } from "react";
import { getJobs, applyToJob, getApplications } from '../services/api';

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [applyStatus, setApplyStatus] = useState({}); // { [jobId]: 'success' | 'error' }
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({
    jobType: [],
    remoteOption: [],
    experienceLevel: [],
    education: [],
    salaryRange: []
  });

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const checkSalaryMatch = (jobSalary, selectedRanges) => {
    if (!jobSalary) return false;
    const salary = parseInt(jobSalary.replace(/[^0-9]/g, ''), 10);
    if (isNaN(salary)) return false;

    return selectedRanges.some(range => {
      if (range === "0-50000") return salary < 50000;
      if (range === "50000-100000") return salary >= 50000 && salary <= 100000;
      if (range === "100000+") return salary > 100000;
      return false;
    });
  };

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setApplyStatus((prev) => ({ ...prev, [jobId]: undefined }));
    try {
      await applyToJob(jobId);
      setApplyStatus((prev) => ({ ...prev, [jobId]: 'success' }));
      setStatus({ msg: 'Applied!', type: 'success' });
      setAppliedJobIds(prev => new Set(prev).add(jobId));
    } catch (err) {
      setApplyStatus((prev) => ({ ...prev, [jobId]: 'error' }));
      setStatus({ msg: 'Error. Try again.', type: 'error' });
    }
    setApplyingId(null);
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsData, appsData] = await Promise.all([getJobs(), getApplications()]);
        setJobs(jobsData);
        const appliedIds = new Set(appsData.map(app => app.job_id));
        setAppliedJobIds(appliedIds);
      } catch {}
    }
    fetchData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
    const matchesRemote = filters.remoteOption.length === 0 || filters.remoteOption.includes(job.remote_option);
    const matchesExp = filters.experienceLevel.length === 0 || filters.experienceLevel.includes(job.experience_level);
    const matchesEdu = filters.education.length === 0 || filters.education.includes(job.education);
    const matchesSalary = filters.salaryRange.length === 0 || checkSalaryMatch(job.salary, filters.salaryRange);

    return matchesSearch && matchesJobType && matchesRemote && matchesExp && matchesEdu && matchesSalary;
  });

  const getFilterCount = (category, value) => {
    return jobs.filter(job => {
      const matchesSearch = (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                            (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (category === 'salaryRange') return checkSalaryMatch(job.salary, [value]);
      
      const key = {
        'jobType': 'type',
        'remoteOption': 'remote_option',
        'experienceLevel': 'experience_level',
        'education': 'education'
      }[category];
      
      return job[key] === value;
    }).length;
  };

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

        <div className="flex gap-2 ml-auto mt-2 md:mt-0">
          <button className="px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-[#005193] to-[#013362] text-white shadow-lg hover:opacity-90 transition">
            Search Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-8">
        {/* ---------- Sidebar Filters ---------- */}
      <aside className="bg-white p-5 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-xl text-[#013362] leading-tight mb-4">Quick Filters</h3>

          {/* Job Type Filter */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 text-base text-[#013362]">Job Type</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              {['Full-Time', 'Part-Time', 'Contract', 'Internship'].map((type) => (
                <li key={type} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="accent-[#005193]"
                    checked={filters.jobType.includes(type)}
                    onChange={() => handleFilterChange('jobType', type)}
                  /> 
                  {type} <span className="text-gray-400 text-xs">({getFilterCount('jobType', type)})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Remote Option Filter */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 text-base text-[#013362]">Remote Option</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              {['Remote', 'Hybrid', 'On-site'].map((opt) => (
                <li key={opt} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="accent-[#005193]"
                    checked={filters.remoteOption.includes(opt)}
                    onChange={() => handleFilterChange('remoteOption', opt)}
                  /> 
                  {opt} <span className="text-gray-400 text-xs">({getFilterCount('remoteOption', opt)})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience Level Filter */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 text-base text-[#013362]">Experience Level</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              {['Junior', 'Mid', 'Senior', 'Lead'].map((level) => (
                <li key={level} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="accent-[#005193]"
                    checked={filters.experienceLevel.includes(level)}
                    onChange={() => handleFilterChange('experienceLevel', level)}
                  /> 
                  {level} <span className="text-gray-400 text-xs">({getFilterCount('experienceLevel', level)})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Education Filter */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 text-base text-[#013362]">Education</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              {['Bachelor’s', 'Master’s', 'PhD'].map((edu) => (
                <li key={edu} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="accent-[#005193]"
                    checked={filters.education.includes(edu)}
                    onChange={() => handleFilterChange('education', edu)}
                  /> 
                  {edu} <span className="text-gray-400 text-xs">({getFilterCount('education', edu)})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Salary Range Filter */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 text-base text-[#013362]">Salary Range</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="accent-[#005193]"
                  checked={filters.salaryRange.includes("0-50000")}
                  onChange={() => handleFilterChange('salaryRange', "0-50000")}
                /> 
                &lt; ₹50k <span className="text-gray-400 text-xs">({getFilterCount('salaryRange', "0-50000")})</span>
              </li>
              <li className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="accent-[#005193]"
                  checked={filters.salaryRange.includes("50000-100000")}
                  onChange={() => handleFilterChange('salaryRange', "50000-100000")}
                /> 
                ₹50k - ₹100k <span className="text-gray-400 text-xs">({getFilterCount('salaryRange', "50000-100000")})</span>
              </li>
              <li className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="accent-[#005193]"
                  checked={filters.salaryRange.includes("100000+")}
                  onChange={() => handleFilterChange('salaryRange', "100000+")}
                /> 
                &gt; ₹100k <span className="text-gray-400 text-xs">({getFilterCount('salaryRange', "100000+")})</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className="font-bold text-xl text-[#013362] leading-tight mb-2">AI Job Alert</h3>
            <p className="text-sm mb-3 text-gray-600">
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
                  className={`px-5 py-2 rounded-md text-sm font-semibold flex items-center gap-2 text-white shadow-lg transition ${
                    appliedJobIds.has(job.id) 
                      ? "bg-green-600 cursor-default opacity-80" 
                      : "bg-gradient-to-r from-[#005193] to-[#013362] hover:opacity-90"
                  }`}
                  onClick={() => !appliedJobIds.has(job.id) && handleApply(job.id)}
                  disabled={applyingId === job.id || appliedJobIds.has(job.id)}
                >
                  {applyingId === job.id 
                    ? 'Applying...' 
                    : appliedJobIds.has(job.id) 
                      ? 'Application Sent' 
                      : 'Apply Now'}
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
                  className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-md transition ${
                    appliedJobIds.has(selectedJob.id)
                      ? "bg-green-600 cursor-default opacity-80"
                      : "bg-gradient-to-r from-[#005193] to-[#013362] hover:opacity-90"
                  }`}
                  onClick={() => { 
                    if (!appliedJobIds.has(selectedJob.id)) {
                      handleApply(selectedJob.id); 
                      setSelectedJob(null); 
                    }
                  }}
                  disabled={applyingId === selectedJob.id || appliedJobIds.has(selectedJob.id)}
                >
                  {applyingId === selectedJob.id 
                    ? 'Applying...' 
                    : appliedJobIds.has(selectedJob.id) 
                      ? 'Application Sent' 
                      : 'Apply Now'}
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
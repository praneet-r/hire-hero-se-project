import React, { useState, useEffect } from "react";
import { getJobs, getEmployees, getProfiles } from "../services/api";
import axios from "axios";
import {
  Users,
  Briefcase,
  BarChart2,
  Lightbulb,
  TrendingUp,
  Plus,
  Filter,
  Mail,
  User,
  Code,
  Brush,
  Sparkles,
  Megaphone,
} from "lucide-react";

const RecruitmentTab = () => {
    const [pillMessage, setPillMessage] = useState("");
    const [pillType, setPillType] = useState(""); // 'success' or 'error'
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editFields, setEditFields] = useState({
    description: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    tags: "",
    status: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [holding, setHolding] = useState(false);
  // Update job description API
  const handleSaveJob = async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      // Prepare payload for backend
      const payload = {
        description: editFields.description,
        company: editFields.company,
        department: editFields.department,
        location: editFields.location,
        type: editFields.employmentType || editFields.type,
        remoteOption: editFields.remoteOption,
        experienceLevel: editFields.experienceLevel,
        education: editFields.education,
        salary: `${editFields.salaryMin || ''}-${editFields.salaryMax || ''}`,
        tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
        benefits: Array.isArray(editFields.benefits) ? editFields.benefits.join(',') : (editFields.benefits || ''),
        applicationDeadline: editFields.applicationDeadline,
        status: editFields.status
      };
      const res = await axios.put(`/api/jobs/${selectedJob.id}`, payload);
      setJobs(jobs => jobs.map(j => j.id === selectedJob.id ? { ...j, ...editFields, tags: payload.tags.split(',') } : j));
      setShowModal(false);
      setSelectedJob(null);
      setPillMessage("Job updated successfully!");
      setPillType("success");
      setTimeout(() => setPillMessage("") , 3000);
    } catch (err) {
      setPillMessage("Failed to update job.");
      setPillType("error");
      setTimeout(() => setPillMessage("") , 3000);
    }
    setSaving(false);
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/jobs/${selectedJob.id}`);
      setJobs(jobs => jobs.filter(j => j.id !== selectedJob.id));
      setShowModal(false);
      setSelectedJob(null);
    } catch (err) {}
    setDeleting(false);
  };

  const handleHoldJob = async () => {
    if (!selectedJob) return;
    setHolding(true);
    try {
      await axios.put(`/api/jobs/${selectedJob.id}`, { status: 'on hold' });
      setJobs(jobs => jobs.map(j => j.id === selectedJob.id ? { ...j, status: 'on hold' } : j));
      setShowModal(false);
      setSelectedJob(null);
    } catch (err) {}
    setHolding(false);
  };

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function fetchEmployees() {
      const data = await getEmployees();
      setEmployees(data || []);
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch jobs
      const jobsData = await getJobs();
      // Add icon based on job title/department (simple mapping)
      const jobsWithIcons = (jobsData || []).map((job) => ({
        ...job,
        icon:
          /engineer|developer/i.test(job.title) ? Code :
          /design/i.test(job.title) ? Brush :
          /market|marketing/i.test(job.title) ? Megaphone : Briefcase,
        applications: job.applications_count || 0,
        qualified: job.qualified_count || 0,
      }));
      setJobs(jobsWithIcons);

      // Fetch candidates (profiles with role 'candidate')
      const profiles = await getProfiles();
      const candidates = (profiles || [])
        .filter((p) => (p.role || '').toLowerCase() === 'candidate')
        .map((p, idx) => ({
          id: p.id || idx,
          name: p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name || p.last_name || p.email,
          role: p.summary || p.role || 'Applicant',
          match: p.completeness ? `${Math.round((p.completeness || 0) * 100)}%` : `${Math.floor(Math.random()*21)+80}%`,
        }));
      setCandidates(candidates);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {pillMessage && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-2 rounded-full font-semibold shadow-lg text-sm transition-all duration-300 ${pillType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {pillMessage}
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-[#013362] flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-[#005193]" /> Recruitment
        </h1>
        <div className="flex gap-3">
          <a href="/post-job" className="flex items-center gap-2 bg-[#005193] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Post New Job
          </a>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const totalEmployees = employees.length;
          const remoteWorkers = employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('remote')).length;
          const onSiteWorkers = employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('on-site') || (e.job_location || e.status || '').toLowerCase().includes('onsite')).length;
          const avgPerformance = employees.length ? `${Math.round(employees.reduce((sum, e) => sum + (e.performance || 80), 0) / employees.length)}%` : "—";
          const metrics = [
            { label: "Total Employees", value: totalEmployees, icon: Users },
            { label: "Remote Workers", value: remoteWorkers, icon: User },
            { label: "On-site Workers", value: onSiteWorkers, icon: Briefcase },
            { label: "Avg Performance", value: avgPerformance, icon: BarChart2 },
          ];
          return metrics.map((metric, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition"
            >
              <metric.icon className="h-6 w-6 mb-1 text-[#005193] mx-auto" />
              <h3 className="text-xl font-bold text-[#013362]">{metric.value}</h3>
              <p className="text-gray-500 text-sm">{metric.label}</p>
            </div>
          ));
        })()}
      </div>

      {/* Active Job Postings + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job Postings */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#005193]" /> Active Job Postings
          </h2>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:bg-[#F8FAFF] transition"
              >
                <div className="flex items-center gap-3">
                  <job.icon className="h-6 w-6 text-[#005193]" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <div className="text-xs text-gray-500 flex gap-4 mt-1">
                      <span>{job.applications} applications</span>
                      <span>{job.qualified} qualified</span>
                    </div>
                  </div>
                </div>
                <button
                  className="text-sm border border-gray-300 text-[#005193] px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-50"
                  onClick={() => {
                    setSelectedJob(job);
                    setEditFields({
                      description: job.description || "",
                      company: job.company || "",
                      department: job.department || job.department_name || "",
                      employmentType: job.employmentType || job.type || "",
                      remoteOption: job.remoteOption || job.remote_option || "",
                      location: job.location || "",
                      tags: Array.isArray(job.tags) ? job.tags.join(', ') : (job.tags || ""),
                      experienceLevel: job.experienceLevel || job.experience_level || "",
                      education: job.education || job.education_level || "",
                      salaryMin: job.salaryMin || (job.salary && job.salary.split('-')[0]) || "",
                      salaryMax: job.salaryMax || (job.salary && job.salary.split('-')[1]) || "",
                      benefits: Array.isArray(job.benefits) ? job.benefits : (job.benefits ? job.benefits.split(',').map(b => b.trim()) : []),
                      applicationDeadline: job.applicationDeadline || job.application_deadline || "",
                      status: job.status || ""
                    });
                    setShowModal(true);
                  }}
                >
                  View
                </button>
                    {/* Edit Job Description Modal */}
                    {showModal && selectedJob && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-4xl relative">
                          <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                            onClick={() => setShowModal(false)}
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <h2 className="text-2xl font-bold mb-6 text-[#013362]">Edit Job</h2>
                          <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                              <div className="font-semibold text-[#005193] mb-2">{selectedJob.title}</div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.company || ''}
                                onChange={e => setEditFields(f => ({ ...f, company: e.target.value }))}
                              />
                              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                              <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.department || ''}
                                onChange={e => setEditFields(f => ({ ...f, department: e.target.value }))}
                              />
                              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                              <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.employmentType || ''}
                                onChange={e => setEditFields(f => ({ ...f, employmentType: e.target.value }))}
                              >
                                <option value="">Select...</option>
                                <option>Full-Time</option>
                                <option>Part-Time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                              </select>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Remote Option</label>
                              <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.remoteOption || ''}
                                onChange={e => setEditFields(f => ({ ...f, remoteOption: e.target.value }))}
                              >
                                <option value="">Select...</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                                <option>On-site</option>
                              </select>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.location || ''}
                                onChange={e => setEditFields(f => ({ ...f, location: e.target.value }))}
                              />
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#005193] min-h-[80px]"
                                value={editFields.description}
                                onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
                              <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.tags}
                                onChange={e => setEditFields(f => ({ ...f, tags: e.target.value }))}
                              />
                              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                              <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.experienceLevel || ''}
                                onChange={e => setEditFields(f => ({ ...f, experienceLevel: e.target.value }))}
                              >
                                <option value="">Select...</option>
                                <option>Junior</option>
                                <option>Mid</option>
                                <option>Senior</option>
                                <option>Lead</option>
                              </select>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                              <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005193]"
                                value={editFields.education || ''}
                                onChange={e => setEditFields(f => ({ ...f, education: e.target.value }))}
                              >
                                <option value="">Select...</option>
                                <option>Bachelor’s</option>
                                <option>Master’s</option>
                                <option>PhD</option>
                              </select>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (min - max)</label>
                              <div className="flex items-center gap-3">
                                <input type="number" className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm" value={editFields.salaryMin || ''} onChange={e => setEditFields(f => ({ ...f, salaryMin: e.target.value }))} placeholder="Min" />
                                <span>-</span>
                                <input type="number" className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm" value={editFields.salaryMax || ''} onChange={e => setEditFields(f => ({ ...f, salaryMax: e.target.value }))} placeholder="Max" />
                              </div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                              <div className="flex gap-4 flex-wrap">
                                {['Health Insurance', 'Remote Work', 'Paid Leave'].map((b) => (
                                  <label key={b} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={Array.isArray(editFields.benefits) ? editFields.benefits.includes(b) : false}
                                      onChange={e => setEditFields(f => ({
                                        ...f,
                                        benefits: e.target.checked
                                          ? [...(Array.isArray(f.benefits) ? f.benefits : []), b]
                                          : (Array.isArray(f.benefits) ? f.benefits.filter(x => x !== b) : [])
                                      }))}
                                    />
                                    {b}
                                  </label>
                                ))}
                              </div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                              <input
                                type="date"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                                value={editFields.applicationDeadline || ''}
                                onChange={e => setEditFields(f => ({ ...f, applicationDeadline: e.target.value }))}
                              />
                            </div>
                          </form>
                          <div className="flex flex-wrap justify-end gap-2 mt-8">
                            <button
                              className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                              onClick={handleDeleteJob}
                              disabled={deleting}
                            >
                              {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              className="px-5 py-2 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              onClick={handleHoldJob}
                              disabled={holding}
                            >
                              {holding ? 'Holding...' : 'Hold Hiring'}
                            </button>
                            <button
                              className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                              onClick={() => setShowModal(false)}
                              disabled={saving || deleting || holding}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#005193] to-[#013362] text-white hover:opacity-90 transition"
                              onClick={handleSaveJob}
                              disabled={saving || deleting || holding}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#005193]" /> AI Insights
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-md font-bold text-[#013362] flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-[#005193]" /> Top Skill Demand
            </h3>
            <p className="text-sm text-gray-600">
              React and Node.js skills are in high demand this quarter.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-md font-bold text-[#013362] flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[#005193]" /> Hiring Trend
            </h3>
            <p className="text-sm text-gray-600">
              Remote positions receive 40% more applications.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Candidates + Hiring Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#013362] mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#005193]" /> Recent Candidates
          </h2>
          <div className="space-y-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="flex justify-between items-center border border-gray-200 rounded-xl p-4 hover:bg-[#F8FAFF] transition"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#005193]" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{cand.name}</h4>
                    <p className="text-xs text-gray-500">{cand.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#005193]">{cand.match} match</span>
                  <button className="border border-gray-300 text-[#005193] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Pipeline + Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-md font-bold text-[#013362] mb-3">Hiring Pipeline</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-[#E8F1FF] px-3 py-2 rounded-lg font-medium">Applied</div>
              <div className="bg-[#D9E8FF] px-3 py-2 rounded-lg font-medium">Screening</div>
              <div className="bg-[#C3DAFF] px-3 py-2 rounded-lg font-medium">Interview</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-md font-bold text-[#013362] mb-3">Quick Actions</h3>
            <button className="flex items-center gap-2 border border-gray-300 text-[#005193] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 w-full justify-center">
              <Mail className="h-4 w-4" /> Send Bulk Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentTab;

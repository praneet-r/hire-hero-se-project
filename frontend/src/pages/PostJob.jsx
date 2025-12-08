import React, { useState } from "react";
import { createJob } from "../services/api";
import { Wallet, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";
import EmployeesTab from "../components/EmployeesTab";
import RecruitmentTab from "../components/RecruitmentTab";
import PerformanceTab from "../components/PerformanceTab";
import AnalyticsTab from "../components/AnalyticsTab";

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    department: "",
    type: "",
    location: "",
    remote_option: "",
    description: "",
    requiredSkills: [],
    skillInput: "",
    experience_level: "",
    education: "",
    salary: "",
    benefits: [],
    application_deadline: "",
    postToCompany: false,
    postToBoards: false,
    enableAIScreening: false,
  });

  const benefitsOptions = ["Health Insurance", "Remote Work", "Paid Leave"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && benefitsOptions.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        benefits: checked
          ? [...prev.benefits, value]
          : prev.benefits.filter((b) => b !== value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle skill tag input
  const handleSkillInputChange = (e) => {
    setFormData((prev) => ({ ...prev, skillInput: e.target.value }));
  };

  const handleSkillInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && formData.skillInput.trim()) {
      e.preventDefault();
      const newSkill = formData.skillInput.trim();
      if (!formData.requiredSkills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, newSkill],
          skillInput: ""
        }));
      } else {
        setFormData((prev) => ({ ...prev, skillInput: "" }));
      }
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill)
    }));
  };

  const handleSaveDraft = () => {
    console.log("Draft saved:", formData);
    alert("Draft saved!");
  };

  const handlePublish = async () => {
    // Prepare payload, remove skillInput
    const payload = { ...formData };
    delete payload.skillInput;
    try {
      await createJob(payload);
      alert("Job published successfully!");
    } catch (err) {
      alert("Failed to publish job");
    }
  };

  const navigate = useNavigate();

  const tabConfig = [
    { tab: "dashboard", icon: null },
    { tab: "employees", icon: null },
    { tab: "recruitment", icon: null },
    { tab: "performance", icon: null },
    { tab: "analytics", icon: null },
  ];
  const [activeTab, setActiveTab] = useState("postJob");
  const handleTabClick = (tab) => {
    if (tab === "dashboard") {
      navigate("/dashboard-hr");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <section className="min-h-screen flex bg-gradient-to-br from-[#F7F8FF] via-[#e3e9ff] to-[#dbeafe] font-inter">
      <SidebarHR />
      <main className="flex-1 flex flex-col">
        <TopNavbarHR
          activeTab={activeTab}
          setActiveTab={handleTabClick}
          tabConfig={tabConfig}
        />
        <div className="p-8 flex flex-col gap-6">
          {/* Tab Content */}
          {activeTab === "employees" && <EmployeesTab />}
          {activeTab === "recruitment" && <RecruitmentTab />}
          {activeTab === "performance" && <PerformanceTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "postJob" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-[#013362]">Post New Job</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-300 shadow-md hover:opacity-90"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90"
                  >
                    Publish Job
                  </button>
                </div>
              </div>

              <form className="grid lg:grid-cols-3 gap-6 w-full">
                {/* Left Side */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Job Info */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner">
                    <h2 className="text-lg font-semibold mb-4">Job Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Job Title" name="title" value={formData.title} onChange={handleChange} />
                      <Input label="Company Name" name="company" value={formData.company} onChange={handleChange} />
                      <Select label="Select Department" name="department" value={formData.department} onChange={handleChange} options={["Engineering", "HR", "Marketing", "Finance"]} />
                      <Select label="Employment Type" name="type" value={formData.type} onChange={handleChange} options={["Full-Time", "Part-Time", "Contract", "Internship"]} />
                      <Select label="Remote Option" name="remote_option" value={formData.remote_option} onChange={handleChange} options={["Remote", "Hybrid", "On-site"]} />
                      <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner">
                    <h2 className="text-lg font-semibold mb-4">Requirements & Qualifications</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Required Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.requiredSkills.map((skill, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                              {skill}
                              <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemoveSkill(skill)}>&times;</button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          name="skillInput"
                          value={formData.skillInput}
                          onChange={handleSkillInputChange}
                          onKeyDown={handleSkillInputKeyDown}
                          placeholder="Type a skill and press Enter"
                          className="p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <Select label="Experience Level" name="experience_level" value={formData.experience_level} onChange={handleChange} options={["Junior", "Mid", "Senior", "Lead"]} />
                      <Select label="Education" name="education" value={formData.education} onChange={handleChange} options={["Bachelor’s", "Master’s", "PhD"]} />
                    </div>
                  </div>

                  {/* Compensation */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner">
                    <h2 className="text-lg font-semibold mb-4">Compensation & Benefits</h2>
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <Input label="Estimated Salary" name="salary" value={formData.salary} onChange={handleChange} type="text" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Benefits</label>
                      <div className="flex gap-6">
                        {benefitsOptions.map((b) => (
                          <label key={b} className="flex items-center gap-2">
                            <input type="checkbox" value={b} checked={formData.benefits.includes(b)} onChange={handleChange} />
                            {b}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col gap-6">
                  <div className="sticky top-28">
                    {/* Job Posting Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner mb-6">
                      <h2 className="text-lg font-semibold mb-4">Job Posting Settings</h2>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-sm font-medium block mb-1">Application Deadline</label>
                          <input type="date" name="application_deadline" value={formData.application_deadline} onChange={handleChange} className="w-full p-2 border rounded-xl" />
                        </div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="postToCompany" checked={formData.postToCompany} onChange={handleChange} />
                          Post to company website
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="postToBoards" checked={formData.postToBoards} onChange={handleChange} />
                          Post to job boards
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="enableAIScreening" checked={formData.enableAIScreening} onChange={handleChange} />
                          Enable AI screening
                        </label>
                      </div>
                    </div>
                    {/* AI Recommendations */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner">
                      <h2 className="text-lg font-semibold mb-3">AI Recommendations</h2>
                      <div className="mb-4">
                        <h3 className="font-medium mb-1">Suggested Skills</h3>
                        <div className="flex gap-2 flex-wrap">
                          {["React", "Node.js", "TypeScript"].map((skill) => (
                            <span key={skill} className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#005193]" />
                        <h3 className="font-medium mb-1">Salary Range</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Market rate: ₹50000 - ₹100000</p>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-[#005193]" />
                        <h3 className="font-medium mb-1">Market Demand</h3>
                      </div>
                      <p className="text-sm text-gray-600">High demand React roles</p>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </section>
  );
};

// --- Input Component ---
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// --- Select Component ---
const Select = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default PostJob;

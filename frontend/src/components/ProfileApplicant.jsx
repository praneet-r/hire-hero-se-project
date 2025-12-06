const BACKEND_BASE = "http://localhost:5000/api";
import React, { useState, useRef, useEffect } from "react";
import { getProfileMe, updateProfileMe, uploadResume, uploadProfilePic, addExperience } from '../services/api';
import { Camera, Eye, Download, Link2, Plus, X } from "lucide-react";
import TopNavbarApplicant from "../components/TopNavbarApplicant";

const ProfileApplicant = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePic, setProfilePic] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef();
  const [profile, setProfile] = useState({
    fullName: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    summary: "",
    completeness: 0,
    experiences: [],
  });

  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  // Use display_user_id for profile API, numeric user_id for backend
  const userId = localStorage.getItem('display_user_id') || '1';
  const [status, setStatus] = useState({ msg: '', type: '' });

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    // Check if valid date
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const p = await getProfileMe(userId);
        let fullName = p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim();
        let username = p.first_name + p.phone.slice(-3);
        setProfile({
          fullName,
          username: username || '',
          role: p.role || '',
          location: p.location || '',
          email: p.email || '',
          phone: p.phone || '',
          summary: p.summary || '',
          completeness: p.completeness || 0,
          experiences: p.experiences || [],
          profile_pic: p.profile_pic || '',
          resume: p.resume || '',
        });
      } catch {
        setStatus({ msg: 'Could not load profile.', type: 'error' });
      }
    }
    fetchProfile();
  }, [userId]);

  // Handler for updating profile
  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // 2. Manual Save Changes
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await updateProfileMe(userId, {
        location: profile.location,
        phone: profile.phone,
        summary: profile.summary
      });
      setStatus({ msg: 'Changes saved successfully!', type: 'success' });
    } catch {
      setStatus({ msg: 'Failed to save changes.', type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      try {
        await uploadProfilePic(userId, file);
        setStatus({ msg: 'Profile picture uploaded!', type: 'success' });
      } catch {
        setStatus({ msg: 'Failed to upload profile picture.', type: 'error' });
      }
      setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      try {
        await uploadResume(userId, file);
        setStatus({ msg: 'Resume uploaded successfully!', type: 'success' });
      } catch {
        setStatus({ msg: 'Failed to upload resume.', type: 'error' });
      }
      setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await addExperience(newExp);
      setStatus({ msg: 'Experience added!', type: 'success' });
      setShowExpModal(false);
      setNewExp({ title: "", company: "", start_date: "", end_date: "", description: "" });
      // Refresh profile to see new experience
      const p = await getProfileMe(userId);
      setProfile(prev => ({ ...prev, experiences: p.experiences || [] }));
    } catch {
      setStatus({ msg: 'Failed to add experience.', type: 'error' });
    }
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  return (
    <div className="text-[#013362] font-inter w-full">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------- LEFT COLUMN ---------- */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white/90 p-7 rounded-2xl shadow border border-blue-100 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-3">
                {profilePic ? (
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow"
                  />
                ) : profile.profile_pic ? (
                  <img
                    src={BACKEND_BASE + profile.profile_pic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-4xl font-semibold text-blue-600">
                    👤
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-[#005193] to-[#2563eb] text-white rounded-full p-1.5 shadow hover:opacity-90 transition"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </div>
              <h2 className="font-extrabold text-xl text-[#013362]">@{profile.username}</h2>
              <p className="text-sm text-gray-600 font-medium">{profile.role}</p>
              <p className="text-xs text-gray-500">{profile.location}</p>

              {/* Progress Bar */}
              <div className="w-full mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-left text-gray-500">Profile completeness</span>
                  <span className="text-xs font-semibold text-[#005193]">{profile.completeness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#005193] to-[#013362] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profile.completeness}%` }}
                  ></div>
                </div>
              </div>

              <label className="mt-5 bg-gradient-to-r from-[#005193] to-[#013362] hover:opacity-90 text-white px-6 py-2 rounded-md text-sm font-semibold shadow-lg transition cursor-pointer">
                Upload Resume
                <input type="file" accept="application/pdf,.doc,.docx" className="hidden" onChange={handleResumeChange} />
              </label>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="font-semibold text-xl mb-4 text-[#013362]">Quick Actions</h3>
              <ul className="space-y-3 text-base text-[#013362]">
                <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer font-semibold">
                  <Eye className="w-5 h-5" /> Preview Public Profile
                </li>
                {profile.resume && (
                  <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer font-semibold">
                    <Download className="w-5 h-5" />
                    <a href={BACKEND_BASE + profile.resume} target="_blank" rel="noopener noreferrer">Download Resume</a>
                  </li>
                )}
                <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer font-semibold">
                  <Link2 className="w-5 h-5" /> Share Profile
                </li>
              </ul>
            </div>
          </div>

          {/* ---------- RIGHT COLUMN ---------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <div className="bg-white/90 p-8 rounded-2xl shadow border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#013362]">Personal Information</h3>
                {/* [NEW SAVE BUTTON] */}
                <button 
                  onClick={handleSaveChanges} 
                  disabled={loading}
                  className="bg-[#005193] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#013362] transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... Full Name and Email remain readOnly ... */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                  <input type="text" value={profile.fullName} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <input type="email" value={profile.email} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 cursor-not-allowed" />
                </div>

                {/* [UPDATED PHONE INPUT - Removed readOnly, added onChange] */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362]"
                  />
                </div>
                {/* [UPDATED LOCATION INPUT - Changed handler] */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362]"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-500 mb-1">Professional Summary</label>
                {/* [UPDATED TEXTAREA - Changed handler] */}
                <textarea
                  rows="3"
                  value={profile.summary}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362]"
                  onChange={e => handleInputChange('summary', e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white/90 p-8 rounded-2xl shadow border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#013362]">Work Experience</h3>
                {/* [UPDATED BUTTON] */}
                <button 
                  onClick={() => setShowExpModal(true)}
                  className="flex items-center gap-2 text-sm bg-gradient-to-r from-[#005193] to-[#013362] hover:opacity-90 text-white px-4 py-2 rounded-md font-semibold shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
              <div className="space-y-5">
                {profile.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-blue-100 rounded-lg px-4 py-3 hover:bg-[#F7F8FF] transition"
                  >
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center font-semibold rounded-md">
                          {exp.logo}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#013362]">{exp.title}</h4>
                          <p className="text-sm text-gray-500">{exp.company}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 md:mt-0">{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
                    </div>

                    <p className="text-sm text-gray-700 mt-2">{exp.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {(exp.tags || []).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium"
                          style={{ marginBottom: '2px' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
      {showExpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-[#013362]">Add Work Experience</h3>
                    <button onClick={() => setShowExpModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleAddExperience} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-700">Job Title</label>
                        <input required type="text" className="w-full border rounded-lg p-2 text-sm" 
                            value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700">Company</label>
                        <input required type="text" className="w-full border rounded-lg p-2 text-sm" 
                            value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-700">Start Date</label>
                            <input required type="date" className="w-full border rounded-lg p-2 text-sm" 
                                value={newExp.start_date} onChange={e => setNewExp({...newExp, start_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-700">End Date</label>
                            <input type="date" className="w-full border rounded-lg p-2 text-sm" 
                                value={newExp.end_date} onChange={e => setNewExp({...newExp, end_date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-700">Description</label>
                        <textarea className="w-full border rounded-lg p-2 text-sm" rows="3"
                            value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[#005193] text-white py-2 rounded-lg font-semibold hover:opacity-90">
                        Add Experience
                    </button>
                </form>
            </div>
        </div>
      )}
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
  );
}

export default ProfileApplicant;
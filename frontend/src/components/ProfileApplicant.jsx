const BACKEND_BASE = "http://localhost:5000";
import React, { useState, useRef, useEffect } from "react";
import { getProfileMe, updateProfileMe, uploadResume, uploadProfilePic } from '../services/api';
import { Camera } from "lucide-react";
import { Eye, Download, Link2 } from "lucide-react";
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

  // Use display_user_id for profile API, numeric user_id for backend
  const userId = localStorage.getItem('display_user_id') || '1';
  const [status, setStatus] = useState({ msg: '', type: '' });

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
  const handleProfileUpdate = async (field, value) => {
    try {
      await updateProfileMe(userId, { [field]: value });
      setProfile(p => ({ ...p, [field]: value }));
      setStatus({ msg: 'Profile updated successfully!', type: 'success' });
    } catch {
      setStatus({ msg: 'Failed to update profile.', type: 'error' });
    }
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
        setStatus({ msg: 'Resume uploaded and sent for AI training!', type: 'success' });
      } catch {
        setStatus({ msg: 'Failed to upload resume.', type: 'error' });
      }
      setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
    }
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
              <h3 className="text-xl font-bold mb-6 text-[#013362]">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362] bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362] bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={e => handleProfileUpdate('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362]"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-500 mb-1">Professional Summary</label>
                <textarea
                  rows="3"
                  value={profile.summary}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#013362]"
                  onChange={e => handleProfileUpdate('summary', e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white/90 p-8 rounded-2xl shadow border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#013362]">Work Experience</h3>
                <button className="text-sm bg-gradient-to-r from-[#005193] to-[#013362] hover:opacity-90 text-white px-4 py-2 rounded-md font-semibold shadow-md transition">
                  + Add Experience
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
                          <h4 className="font-semibold text-[#013362]">{exp.role}</h4>
                          <p className="text-sm text-gray-500">{exp.company}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 md:mt-0">{exp.duration}</p>
                    </div>

                    <p className="text-sm text-gray-700 mt-2">{exp.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {exp.tags.map((tag, i) => (
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
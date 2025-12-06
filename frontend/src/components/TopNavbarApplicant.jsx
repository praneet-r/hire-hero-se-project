import React, { useState } from "react";
import ProfileApplicant from "../components/ProfileApplicant";
import { LogOut, Bell, User, Settings, Users } from "lucide-react";


const tabConfig = [
  { tab: "dashboard", label: "Dashboard" },
  { tab: "jobs", label: "Jobs" },
  { tab: "applications", label: "Applications" },
  { tab: "chat", label: "Chat" },
];

const TopNavbarApplicant = ({ activeTab, setActiveTab }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  const [showProfile, setShowProfile] = useState(false);
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm px-8 py-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#013362] to-[#005193] text-white rounded-xl p-3 shadow-md flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#013362] tracking-tight ml-2">HireHero</h2>
        </div>
        <div className="flex items-center gap-6">
          {tabConfig.map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize font-medium text-md flex items-center gap-2 transition ${
                activeTab === tab
                  ? "text-[#005193] border-b-2 border-[#005193] pb-1"
                  : "text-gray-500 hover:text-[#013362]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-600">
        <Bell className="h-5 w-5 cursor-pointer hover:text-[#005193]" />
        <div className="relative">
          <User
            className="h-5 w-5 cursor-pointer hover:text-[#005193]"
            onClick={() => {
              setActiveTab && setActiveTab("profile");
              setShowProfile(false);
            }}
          />
        </div>
        <Settings className="h-5 w-5 cursor-pointer hover:text-[#005193]" />
        <button
          className="flex items-center gap-1 px-2 py-1 rounded text-[#d32f2f] font-medium text-sm transition"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNavbarApplicant;

import { Bell, User, Settings, LogOut } from "lucide-react";

const TopNavbarHR = ({ activeTab, setActiveTab, tabConfig }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm px-8 py-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-8">
        {tabConfig.map(({ tab, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize font-medium text-md flex items-center gap-2 transition ${
              activeTab === tab
                ? "text-[#005193] border-b-2 border-[#005193] pb-1"
                : "text-gray-500 hover:text-[#013362]"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />} {tab}
          </button>
        ))}
      </div>
      {/* User actions */}
      <div className="flex items-center gap-4 text-gray-600">
        <Bell className="h-5 w-5 cursor-pointer hover:text-[#005193]" />
        <User className="h-5 w-5 cursor-pointer hover:text-[#005193]" />
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

export default TopNavbarHR;

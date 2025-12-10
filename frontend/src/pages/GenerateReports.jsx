import React, { useState } from "react";
import { Users, BarChart2, Briefcase, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";

const GenerateReports = () => {
    const [reportType, setReportType] = useState("");
    const [department, setDepartment] = useState("");
    const [dateRange, setDateRange] = useState("");
    const [outputFormat, setOutputFormat] = useState("pdf");
    const [deliveryEmail, setDeliveryEmail] = useState("");

    const recentReports = [
      {
        title: "Q3 2024 Employee Report",
        date: "Generated on Jan 2, 2025",
      },
      {
        title: "Performance Review Summary",
        date: "Generated on Dec 22, 2024",
      },
      {
        title: "Recruitment Pipeline Analysis",
        date: "Generated on Jan 10, 2025",
      },
    ];

    const navigate = useNavigate();
    const tabConfig = [
      { tab: "dashboard", icon: BarChart2 },
      { tab: "employees", icon: Users },
      { tab: "recruitment", icon: Briefcase },
      { tab: "performance", icon: FileText },
      { tab: "analytics", icon: BarChart2 },
    ];
    
    // Kept activeTab as 'generateReport' for visual distinction (none of the top tabs highlighted)
    const [activeTab, setActiveTab] = useState("generateReport");

    // UPDATED: Navigation logic
    const handleTabClick = (tab) => {
      navigate("/dashboard-hr", { state: { activeTab: tab } });
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
            {/* Generate Reports Content - Always Visible */}
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#013362]">Generate Reports</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-300 shadow-md hover:opacity-90">
                  Schedule Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90">
                  Generate Now
                </button>
              </div>
            </div>

            {/* Report Type Selection with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Employee Report", icon: Users },
                { label: "Performance Report", icon: BarChart2 },
                { label: "Recruitment Report", icon: Briefcase },
                { label: "Payroll Report", icon: FileText },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={`flex flex-col items-center justify-center border rounded-lg p-4 gap-2 hover:bg-blue-50 text-center text-gray-700 transition-all shadow-sm ${reportType === label ? "border-[#005193] bg-blue-100 shadow-md" : "border-gray-200 bg-white"}`}
                  onClick={() => setReportType(label)}
                >
                  <Icon className={`h-7 w-7 ${reportType === label ? "text-[#005193]" : "text-gray-400"}`} />
                  <span className="font-semibold text-md">{label}</span>
                </button>
              ))}
            </div>

            {/* Report Configuration */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-inner space-y-4">
              <h2 className="text-lg font-medium text-gray-800">Report Configuration</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border rounded-md p-2 w-full">
                  <option value="">Report Designation Type</option>
                  <option>Employee Report</option>
                  <option>Recruitment Report</option>
                  <option>Performance Report</option>
                </select>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border rounded-md p-2 w-full">
                  <option value="">Department Filter</option>
                  <option>Software Engineering</option>
                  <option>Healthcare</option>
                  <option>Digital Marketing</option>
                  <option>Legal</option>
                  <option>Finance</option>
                </select>
                <input type="date" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border rounded-md p-2 w-full" />
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border rounded-md p-2 w-full">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="xls">Excel</option>
                </select>
              </div>
              <div className="pt-4">
                <h3 className="font-medium mb-2 text-gray-700">Include Sections</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["Executive Summary", "Key Metrics", "AI Recommendations", "Detailed Analytics", "Comparative Data", "Trend Analysis"].map((section) => (
                    <label key={section} className="flex items-center space-x-2">
                      <input type="checkbox" className="accent-blue-600" />
                      <span className="text-gray-700 text-sm">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribution & Recent Reports */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-inner">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Distribution</h2>
                <div className="space-y-3">
                  <h3 className="text-gray-700 text-sm font-medium">Share with:</h3>
                  {["Executive Team", "Department Managers", "HR Team"].map((team) => (
                    <label key={team} className="flex items-center space-x-2">
                      <input type="checkbox" className="accent-blue-600" />
                      <span className="text-gray-700 text-sm">{team}</span>
                    </label>
                  ))}
                  <div className="pt-4">
                    <label className="text-sm text-gray-700 font-medium">Delivery Method</label>
                    <input type="email" placeholder="Email" value={deliveryEmail} onChange={(e) => setDeliveryEmail(e.target.value)} className="border rounded-md p-2 w-full mt-1" />
                    <button className="mt-3 px-4 py-2 bg-gradient-to-r from-[#013362] to-[#005193] text-white rounded-md hover:opacity-90">Send Report</button>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-inner">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Reports</h2>
                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <div key={index} className="border rounded-md p-3 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-800">{report.title}</p>
                        <p className="text-xs text-gray-500">{report.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1" title="PDF">
                          <Download className="h-5 w-5" /> PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    );
}

export default GenerateReports;
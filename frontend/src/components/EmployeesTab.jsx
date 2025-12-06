import React, { useState, useEffect } from "react";
import { getEmployees } from "../services/api";
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

const EmployeesTab = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [locationFilter, setLocationFilter] = useState("");
    const [locationOptions, setLocationOptions] = useState([]);

    // Fetch employee data (AJAX)
    useEffect(() => {
      async function fetchEmployees() {
        try {
          const data = await getEmployees();
          setEmployees(data);
          setFilteredEmployees(data);
          // Extract unique departments and job locations
          const departments = Array.from(new Set(data.map(e => e.department).filter(Boolean)));
          const locations = Array.from(new Set(data.map(e => e.job_location).filter(Boolean)));
          setDepartmentOptions(departments);
          setLocationOptions(locations);
        } catch (err) {
          console.error("Failed to fetch employees", err);
        }
      }
      fetchEmployees();
    }, []);

    // Live search + filter logic
    useEffect(() => {
      let filtered = employees.filter((emp) =>
        (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (departmentFilter)
        filtered = filtered.filter((emp) => emp.department === departmentFilter);
      if (locationFilter)
        filtered = filtered.filter((emp) => emp.job_location === locationFilter);
      setFilteredEmployees(filtered);
    }, [searchTerm, departmentFilter, locationFilter, employees]);

    return (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-[#013362] flex items-center gap-2">
              <Users className="h-6 w-6 text-[#005193]" />
              Employees
            </h1>
            <div className="flex justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#005193] focus:border-[#005193]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
                </svg>
              </div>
              <a href="/add-employee" className="flex items-center gap-2 bg-[#005193] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
                <Plus className="h-4 w-4" /> Add Employee
              </a>
            </div>
          </div>
          {/* Stats and Filters */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
              {[
                { label: "Total Employees", value: employees.length, icon: Users },
                { label: "Remote Workers", value: employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('remote')).length, icon: User },
                { label: "On-site Workers", value: employees.filter(e => (e.job_location || e.status || '').toLowerCase().includes('on-site') || (e.job_location || e.status || '').toLowerCase().includes('onsite')).length, icon: Briefcase },
                { label: "Avg Performance", value: employees.length ? `${Math.round(employees.reduce((sum, e) => sum + (e.performance || 80), 0) / employees.length)}%` : "—", icon: BarChart2 },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center hover:shadow-md transition flex flex-col items-center"
                >
                  <stat.icon className="h-6 w-6 mb-1 text-[#005193]" />
                  <h3 className="text-xl font-extrabold text-[#013362]">{stat.value}</h3>
                  <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Employee Directory */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#013362] flex items-center gap-2">
                <Users className="h-5 w-5 text-[#005193]" /> Employee Directory
              </h2>
              {/* Filters */}
              <div className="flex justify-end items-center">
                <div className="flex gap-2">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#005193] focus:border-[#005193]"
                  >
                    <option value="">All Departments</option>
                    {departmentOptions.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#005193] focus:border-[#005193]"
                  >
                    <option value="">All Job Locations</option>
                    {locationOptions.map((loc, i) => (
                      <option key={i} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="grid grid-cols-7 text-sm font-semibold text-[#013362] border-b border-gray-200 pb-2">
              <div>Employee</div>
              <div>Department</div>
              <div>Job Location</div>
              <div>Status</div>
              <div>Start Date</div>
              <div>Role</div>
              <div className="text-right">Actions</div>
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-gray-100 mt-2">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-7 items-center text-sm py-3 hover:bg-[#F7F8FF] transition"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-[#005193]" />
                      <span className="font-medium text-gray-800">{emp.name}</span>
                    </div>
                    <div className="text-gray-600">{emp.department}</div>
                    <div className="text-gray-600">{emp.job_location}</div>
                    <div
                      className={`font-semibold ${
                        emp.status === "Active"
                          ? "text-green-600"
                          : emp.status === "On Leave"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {emp.status || "Active"}
                    </div>
                    <div className="text-gray-600">{emp.hired_at ? new Date(emp.hired_at).toLocaleDateString() : "-"}</div>
                    <div className="text-gray-600">{emp.role}</div>
                    <div className="text-right flex gap-2 justify-end">
                      <button className="border border-gray-300 text-[#005193] px-2 py-1 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">
                        View
                      </button>
                      {emp.status && emp.status.toLowerCase() !== "active" && (
                        <button className="border border-green-500 text-green-600 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-green-50 transition">
                          Activate
                        </button>
                      )}
                      {(!emp.status || emp.status.toLowerCase() === "active") && (
                        <button className="border border-yellow-500 text-yellow-600 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-50 transition">
                          Deactivate
                        </button>
                      )}
                      <button className="border border-red-500 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-red-50 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">No employees found.</div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>
        </div>  
    
        );
};

export default EmployeesTab;
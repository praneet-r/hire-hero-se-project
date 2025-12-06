import React, { useState, useEffect } from "react";
import axios from "axios";
import { createEmployee, axiosAuth } from "../services/api";
import { getProfileByUserId } from "../services/api";
import { useNavigate } from "react-router-dom";
import SidebarHR from "../components/SidebarHR";
import TopNavbarHR from "../components/TopNavbarHR";
import EmployeesTab from "../components/EmployeesTab";
import RecruitmentTab from "../components/RecruitmentTab";
import PerformanceTab from "../components/PerformanceTab";
import AnalyticsTab from "../components/AnalyticsTab";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    manager: "",
    startDate: "",
    photo: null, // File object for upload
    photoUrl: "", // URL for preview (from backend for internal)
  });

  const [hiringType, setHiringType] = useState("external"); // 'internal' or 'external'
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (hiringType === "internal") {
      axios.get("/api/auth/users/basic").then(res => setUsers(res.data));
    }
  }, [hiringType]);

  // When user is selected for internal, auto-fill formData
  useEffect(() => {
    if (hiringType === "internal" && selectedUserId) {
      getProfileByUserId(selectedUserId).then(profile => {
        setFormData(prev => ({
          ...prev,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          photo: null, // Clear file input
          photoUrl: profile.profile_pic || ""
        }));
      });
    } else {
      setFormData(prev => ({ ...prev, photoUrl: "" }));
    }
  }, [selectedUserId, hiringType]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let photoPath = "";
      if (formData.photo) {
        // Upload photo to backend (single copy, proper naming)
        const uploadData = new FormData();
        const baseName = formData.email || (formData.firstName + formData.lastName) || "employee";
        const ext = formData.photo.name.split('.').pop();
        const filename = `employee_${baseName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.${ext}`;
        uploadData.append("photo", formData.photo, filename);
        const uploadRes = await axiosAuth.post("/hr/employees/upload_photo", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photoPath = uploadRes.data.photo;
      }
      let payload = {
        job_title: formData.jobTitle,
        department: formData.department,
        manager: formData.manager,
        start_date: formData.startDate,
        photo: photoPath,
        job_location: formData.jobLocation || ""
      };
      if (hiringType === "internal") {
        // Send only user_id for internal
        payload.user_id = selectedUserId;
      } else {
        // Send user info for external
        payload.first_name = formData.firstName;
        payload.last_name = formData.lastName;
        payload.email = formData.email;
        payload.phone = formData.phone;
        // Optionally, you can add password or role if needed
      }
      await createEmployee(payload);
      alert("Employee added successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        department: "",
        manager: "",
        startDate: "",
        photo: null,
      });
      setSelectedUserId("");
    } catch (err) {
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      manager: "",
      startDate: "",
      photo: null,
    });
  };

  const navigate = useNavigate();

  const tabConfig = [
    { tab: "dashboard", icon: null },
    { tab: "employees", icon: null },
    { tab: "recruitment", icon: null },
    { tab: "performance", icon: null },
    { tab: "analytics", icon: null },
  ];

  const [activeTab, setActiveTab] = useState("addEmployee");

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
          {activeTab === "addEmployee" && (
            <>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-[#013362]">Add New Employee</h2>
                <div className="flex gap-3 items-center">
                  <label className="font-medium text-sm mr-2">Hiring Type:</label>
                  <select
                    value={hiringType}
                    onChange={e => {
                      setHiringType(e.target.value);
                      setSelectedUserId("");
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        jobTitle: "",
                        department: "",
                        manager: "",
                        startDate: "",
                        photo: null,
                      });
                    }}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="external">External</option>
                    <option value="internal">Internal</option>
                  </select>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-300 shadow-md hover:opacity-90"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#013362] to-[#005193] text-white shadow-md hover:opacity-90"
                  >
                    Save Employee
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-inner w-full"
              >
                <div className="grid md:grid-cols-3 gap-6 items-start mb-8">
                  <div className="md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                    {hiringType === "internal" ? (
                      <>
                        <div className="mb-4">
                          <label className="text-sm font-medium mb-1 block">Select User</label>
                          <select
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                          >
                            <option value="">-- Select User --</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                          <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                          <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Profile Photo</h2>
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-3">
                      {formData.photo
                        ? <img src={URL.createObjectURL(formData.photo)} alt="Profile" className="w-full h-full object-cover" />
                        : formData.photoUrl
                          ? <img src={formData.photoUrl.startsWith("/uploads") ? formData.photoUrl : `/uploads/${formData.photoUrl}`} alt="Profile" className="w-full h-full object-cover" />
                          : <span className="text-gray-500 text-sm">No Photo</span>
                      }
                    </div>
                    <input type="file" name="photo" accept="image/*" onChange={handleChange} className="text-sm" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">Job Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
                    <SelectField label="Select Department" name="department" value={formData.department} onChange={handleChange} options={["Engineering", "HR", "Marketing", "Finance"]} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectField label="Select Manager" name="manager" value={formData.manager} onChange={handleChange} options={["John Doe", "Jane Smith", "Rahul Mehta", "Ava Wilson"]} />
                    <SelectField label="Job Location" name="jobLocation" value={formData.jobLocation || ""} onChange={handleChange} options={["Remote Worker", "On-site Worker"]} />
                    <InputField label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
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

// --- Reusable InputField Component ---
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

// --- Reusable SelectField Component ---
const SelectField = ({ label, name, value, onChange, options = [] }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

export default AddEmployee;

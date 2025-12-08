import axios from "axios";

const API_BASE = "/api";
const AUTH_BASE = "/api/auth";

export const setToken = (token) => {
    localStorage.setItem("token", token);
};

export const getToken = () => {
    return localStorage.getItem("token");
};

// Axios instance for authenticated requests
export const axiosAuth = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});
axiosAuth.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- Auth Endpoints ---
export const login = async (email, password) => {
    const res = await axios.post(`${AUTH_BASE}/login`, { email, password });
    if (res.data && res.data.token) setToken(res.data.token); // Note: Backend returns 'token' not 'access_token' in Phase 1
    if (res.data && res.data.id)
        localStorage.setItem("user_id", String(res.data.id));
    return res.data;
};

export const register = async (userData) => {
    const res = await axios.post(`${AUTH_BASE}/register`, userData);
    if (res.data && res.data.token) setToken(res.data.token);
    if (res.data && res.data.id)
        localStorage.setItem("user_id", String(res.data.id));
    return res.data;
};

// --- Job Seeker API ---

export const getJobs = async () => {
    // Returns { pagination: {...}, jobs: [...] }
    // Frontend might expect array directly, let's check.
    // DashboardApplicant: const jobs = await getJobs(); setRecommendedJobs(jobs.slice(0, 2));
    // So it expects an array.
    const res = await axiosAuth.get("/jobs");
    if (res.data.jobs) return res.data.jobs;
    return res.data; // Fallback
};

export const applyToJob = async (jobId) => {
    const userId = localStorage.getItem("user_id") || "1";
    // Note: Backend now expects just job_id in body for authenticated user
    const res = await axiosAuth.post("/applications", {
        job_id: jobId,
        user_id: userId,
    });
    return res.data;
};

export const withdrawApplication = async (appId) => {
    const res = await axiosAuth.delete(`/applications/my/${appId}`);
    return res.data;
};

export const getApplications = async () => {
    // Backend returns: [{ application_details: {...}, job_details: {...} }]
    // Frontend expects: [{ id, status, title, company, ... }]
    const res = await axiosAuth.get("/applications/my");

    if (Array.isArray(res.data)) {
        return res.data.map((item) => ({
            id: item.application_details.id,
            job_id: item.application_details.job_id,
            status: item.application_details.status,
            applied_at: item.application_details.applied_at,
            title: item.job_details.title,
            company: item.job_details.company,
            tags: item.job_details.tags || [],
            description: item.job_details.description,
            salary: item.job_details.salary || "Not disclosed",
        }));
    }
    return [];
};

export const getProfileMe = async (userId) => {
    // userId param is legacy override, prefer token
    const res = await axiosAuth.get("/profiles/me", {
        headers: userId ? { "X-User-Id": userId } : {},
    });
    return res.data;
};

export const updateProfileMe = async (userId, data) => {
    const res = await axiosAuth.put("/profiles/me", data, {
        headers: userId ? { "X-User-Id": userId } : {},
    });
    return res.data;
};

export const addExperience = async (experienceData) => {
    const res = await axiosAuth.post(
        "/profiles/me/experiences",
        experienceData
    );
    return res.data;
};

export const deleteExperience = async (expId) => {
    const res = await axiosAuth.delete(`/profiles/me/experiences/${expId}`);
    return res.data;
};

export const addEducation = async (educationData) => {
    const res = await axiosAuth.post("/profiles/me/education", educationData);
    return res.data;
};

export const deleteEducation = async (id) => {
    const res = await axiosAuth.delete(`/profiles/me/education/${id}`);
    return res.data;
};

export const uploadResume = async (userId, file) => {
    const formData = new FormData();
    formData.append("resume", file);
    // Use axiosAuth for token
    const res = await axiosAuth.post("/profiles/me/resume", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            ...(userId ? { "X-User-Id": userId } : {}),
        },
    });
    return res.data;
};

export const uploadProfilePic = async (userId, file) => {
    const formData = new FormData();
    formData.append("profile_pic", file);
    const res = await axiosAuth.post("/profiles/me/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            ...(userId ? { "X-User-Id": userId } : {}),
        },
    });
    return res.data;
};

// --- HR API ---

export const getEmployees = async () => {
    const res = await axiosAuth.get("/hr/employees");
    // Backend returns { pagination: ..., employees: [...] }
    if (res.data.employees) return res.data.employees;
    return res.data;
};

export const getCandidates = async () => {
    // Uses auth endpoint to get basic user info for candidates
    const res = await axiosAuth.get("/auth/users/basic");
    return res.data;
};

export const getCompanyApplications = async (jobId = null) => {
    // Append job_id query param if provided
    const url = jobId ? `/hr/applications?job_id=${jobId}` : "/hr/applications";
    const res = await axiosAuth.get(url);
    if (res.data.applications) return res.data.applications;
    return [];
};

export const updateApplicationStatus = async (appId, status) => {
    const res = await axiosAuth.put(`/hr/applications/${appId}`, { status });
    return res.data;
};

export const createEmployee = async (employeeData) => {
    const res = await axiosAuth.post("/hr/employees", employeeData);
    return res.data;
};

export const updateEmployee = async (id, data) => {
    const res = await axiosAuth.put(`/hr/employees/${id}`, data);
    return res.data;
};

export const deleteEmployee = async (id) => {
    const res = await axiosAuth.delete(`/hr/employees/${id}`);
    return res.data;
};

export const createJob = async (jobData) => {
    const payload = {
        title: jobData.title,
        description: jobData.description,
        company: jobData.company || "",
        department: jobData.department || "",
        location: jobData.location,
        type: jobData.type,
        remote_option: jobData.remote_option || "", // Map to correct field
        experience_level: jobData.experience_level || "",
        education: jobData.education || "",
        salary: jobData.salary,
        tags: jobData.requiredSkills || [], // Send as list
        benefits: Array.isArray(jobData.benefits)
            ? jobData.benefits.join(",")
            : jobData.benefits || "",
        application_deadline: jobData.application_deadline || "",
    };
    const res = await axiosAuth.post("/hr/jobs", payload);
    return res.data;
};

export const getProfileByUserId = async (userId) => {
    const res = await axiosAuth.get(`/hr/profiles/${userId}`);
    return res.data;
};

export const getProfiles = async () => {
    // Legacy endpoint? Not in YAML. Maybe for HR viewing list of candidates?
    // Using /hr/profiles isn't a list endpoint in my spec.
    // Assuming /users/basic or similar is used elsewhere.
    // Leaving empty or mapped to something safe if needed.
    return [];
};

// --- Public Profile API ---
export const getPublicProfile = async (userId) => {
    // Standard axios request without auth headers
    const res = await axios.get(`${API_BASE}/public/profile/${userId}`);
    return res.data;
};

// --- GenAI API ---

export const askChatbot = async (prompt) => {
    const res = await axiosAuth.post("/gen-ai/chat", { prompt });
    return res.data;
};

export const getPerformanceInsights = async () => {
    const res = await axiosAuth.get("/analytics/insights");
    return res.data;
};

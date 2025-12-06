import axios from 'axios'

const API_BASE = '/api'
const AUTH_BASE = '/api/auth'

// Apply to a job
export const applyToJob = async (jobId) => {
  // Get userId from localStorage (same as ProfileApplicant)
  const userId = localStorage.getItem('user_id') || '1';
  const res = await axiosAuth.post('/applications', { job_id: jobId, user_id: userId });
  return res.data;
}
// Fetch AI Performance Insights
export const getPerformanceInsights = async () => {
  // You may need to adjust the endpoint to match your backend route
  const res = await axios.get('/api/analytics/insights');
  return res.data;
}
// Create new job
export const createJob = async (jobData) => {
  // Map frontend fields to backend model
  const payload = {
    title: jobData.title,
    description: jobData.description,
    company: jobData.company || "", // Add company if available
    department: jobData.department || "",
    location: jobData.location,
    type: jobData.employmentType,
    remoteOption: jobData.remoteOption || "",
    experienceLevel: jobData.experienceLevel || "",
    education: jobData.education || "",
    salary: `${jobData.salaryMin}-${jobData.salaryMax}`,
    tags: (jobData.requiredSkills || []).join(","),
    benefits: Array.isArray(jobData.benefits) ? jobData.benefits.join(",") : (jobData.benefits || ""),
    applicationDeadline: jobData.applicationDeadline || ""
  };
  const res = await axiosAuth.post('/jobs', payload);
  return res.data;
};

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

// Get profile by user ID (for HR)
export const getProfileByUserId = async (userId) => {
  const res = await axios.get(`/api/profiles/user/${userId}`);
  return res.data;
}
// Create new employee
export const createEmployee = async (employeeData) => {
  const res = await axiosAuth.post('/employees', employeeData);
  return res.data;
}
// Upload resume file
export const uploadResume = async (userId, file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await axios.post('/api/profiles/me/upload_resume', formData, {
    headers: { 'X-User-Id': userId, 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

// Upload profile picture
export const uploadProfilePic = async (userId, file) => {
  const formData = new FormData();
  formData.append('profile_pic', file);
  const res = await axios.post('/api/profiles/me/upload_profile_pic', formData, {
    headers: { 'X-User-Id': userId, 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}


// Profile API for current user
export const getProfileMe = async (userId) => {
  const token = getToken();
  const res = await axios.get('/api/profiles/me', {
    headers: {
      'X-User-Id': userId,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return res.data;
}

export const updateProfileMe = async (userId, data) => {
  const res = await axios.put('/api/profiles/me', data, {
    headers: { 'X-User-Id': userId }
  });
  return res.data;
}
// Chatbot API call
export const askChatbot = async (prompt) => {
  const res = await axios.post('/api/chatbot/ask', { prompt });
  return res.data;
}

// Axios instance for authenticated requests
export const axiosAuth = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})
axiosAuth.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth endpoints
export const login = async (email, password) => {
  const res = await axios.post(`${AUTH_BASE}/login`, { email, password })
  if (res.data && res.data.access_token) setToken(res.data.access_token)
  // Always use id (numeric PK) for platform user_id
  if (res.data && res.data.id) localStorage.setItem('user_id', String(res.data.id));
  return res.data
}

export const register = async (userData) => {
  const res = await axios.post(`${AUTH_BASE}/register`, userData)
  if (res.data && res.data.id) localStorage.setItem('user_id', String(res.data.id));
  return res.data
}

// Example: Authenticated API calls
export const getJobs = async () => {
  const res = await axiosAuth.get('/jobs')
  return res.data
}

export const getApplications = async () => {
  const res = await axiosAuth.get('/applications')
  return res.data
}

export const getProfiles = async () => {
  const res = await axiosAuth.get('/profiles')
  return res.data
}

export const getEmployees = async () => {
  const res = await axiosAuth.get('/employees')
  return res.data
}
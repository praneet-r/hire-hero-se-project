import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import DashboardHR from './pages/DashboardHR';
import DashboardApplicant from './pages/DashboardApplicant';
import HRGenAI from './pages/HRGenAI'
import AddEmployee from './pages/AddEmployee'
import PostJob from './pages/PostJob'
import GenerateReports from './pages/GenerateReports'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard-hr" element={<DashboardHR />} />
            <Route path="/dashboard-applicant" element={<DashboardApplicant />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hr-genai" element={<HRGenAI />} />
            <Route path="/add-employee" element={<AddEmployee />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/generate-report" element={<GenerateReports />} />
          </Routes>
      </div>
    </AuthProvider>
  )
}
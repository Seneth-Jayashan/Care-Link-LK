import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/navbar'
import Footer from './components/Footer'


import AdminDashboard from './routes/Admindashboardrouttes';


function App() {
  const AdminRoute = ({ children }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (!token || role !== 'admin') {
      return <Navigate to="/login" replace />
    }
    return children;
  }
  return (
    <div>
      <Navbar />
      <Routes>
      
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>
      <Footer />
    </div>
  )
}

export default App



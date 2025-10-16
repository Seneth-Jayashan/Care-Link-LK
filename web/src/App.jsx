<<<<<<< Updated upstream
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AddHospital from './pages/hospitaladmin/AddHospital'
import Aboutus from './pages/Aboutus'

=======
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminPage from './pages/admin/Dashboard';
import HospitalAdmin from './pages/hospitaladmin/Dashboard';
import PatientPage from './pages/patient/Dashboard';
import DoctorPage from './pages/doctor/Dashboard'

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';
>>>>>>> Stashed changes

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
<<<<<<< Updated upstream
      <Routes>
      
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-hospital" element={<AddHospital />} />
        <Route path="/aboutus" element={<Aboutus />} />
        
      </Routes>
=======

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />


          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospitaladmin"
            element={
              <ProtectedRoute roles={['hospitaladmin']}>
                <HospitalAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

>>>>>>> Stashed changes
      <Footer />
    </div>
  );
}

export default App;

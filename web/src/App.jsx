import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AddHospital from './pages/hospitaladmin/AddHospital'
import Aboutus from './pages/Aboutus'


function App() {
  return (
    <div>
      <Navbar />
      <Routes>
      
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-hospital" element={<AddHospital />} />
        <Route path="/aboutus" element={<Aboutus />} />
        
      </Routes>
      <Footer />
    </div>
  )
}

export default App



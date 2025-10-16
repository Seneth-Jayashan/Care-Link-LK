import { Routes, Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/Dashboard";

import AddHospitalManager from "../pages/admin/hospitalamanager/Add";
import EditHospitalManager from "../pages/admin/hospitalamanager/Edit";
import DeleteHospitalManager from "../pages/admin/hospitalamanager/Delete";

export default function Admindashboardrouttes() {
    return (
        <Routes>
            
            <Route path="/" element={<AdminDashboard />} />

            <Route path="/add-hospital-manager" element={<AddHospitalManager />} />
            <Route path="/edit-hospital-manager/:id" element={<EditHospitalManager />} />
            <Route path="/delete-hospital-manager/:id" element={<DeleteHospitalManager />} />
        </Routes>
    );
}
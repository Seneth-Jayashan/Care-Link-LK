import { Routes, Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/Dashboard";

import AddHospitalManager from "../pages/admin/hospitaladmin/Add";
import EditHospitalManager from "../pages/admin/hospitaladmin/Edit";
import DeleteHospitalManager from "../pages/admin/hospitaladmin/Delete";

export default function Admindashboardrouttes() {
    return (
        <Routes>
            
            <Route path="/" element={<AdminDashboard />} />

            <Route path="/add-hospital-manager" element={<AddHospitalManager />} />
            <Route path="/edit-hospital-manager" element={<EditHospitalManager />} />
            <Route path="/delete-hospital-manager" element={<DeleteHospitalManager />} />
        </Routes>
    );
}
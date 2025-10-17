import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Edit } from "lucide-react";
import AddDoctorForm from "../../components/ui/AddDoctorForm";
import api from "../../api/api";
import DoctorForm from "../../components/ui/EditDoctorForm";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);


  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/doctors");
      setDoctors(res?.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(doctors.filter(d => d._id !== id));
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          <UserPlus size={20} /> Add Doctor
        </button>
      </div>

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <table className="w-full border-collapse shadow rounded-xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Specialty</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
           {doctors.map((doc) => (
            <tr key={doc._id} className="border-t">
                <td className="p-3">{doc.user?.name || "-"}</td>
                <td className="p-3">{doc.user?.email || "-"}</td>
                <td className="p-3">{doc.specialty || "-"}</td>
                <td className="p-3">{doc.user?.phone || "-"}</td>
                <td className="p-3 flex gap-2">
                <button
                    onClick={() => { setEditingDoctor(doc); setShowModal(true); }}
                    className="px-3 py-1 bg-yellow-400 text-white rounded-xl flex items-center gap-1"
                >
                    <Edit size={16} /> Edit
                </button>
                <button
                    onClick={() => handleDelete(doc.user?._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-xl flex items-center gap-1"
                >
                    <Trash2 size={16} /> Delete
                </button>
                </td>
            </tr>
            ))}

          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl shadow-xl w-[90%] md:w-3/4 lg:w-1/2 relative p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <AddDoctorForm onClose={() => {
              setShowModal(false);
              fetchDoctors(); // refresh list after adding
            }} />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
            <div className="bg-white rounded-xl shadow-xl w-[90%] md:w-3/4 lg:w-1/2 relative p-6">
            <button
                onClick={() => { setShowModal(false); setEditingDoctor(null); }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
                ✕
            </button>
            <DoctorForm
                doctor={editingDoctor}
                onClose={(refresh) => {
                setShowModal(false);
                setEditingDoctor(null);
                if (refresh) fetchDoctors();
                }}
            />
            </div>
        </div>
        )}
    </div>
  );
}

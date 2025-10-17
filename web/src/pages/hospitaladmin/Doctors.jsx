import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Edit,Stethoscope } from "lucide-react";
import AddDoctorForm from "../../components/ui/AddDoctorForm";
import DoctorForm from "../../components/ui/EditDoctorForm";
import api from "../../api/api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      setDoctors(doctors.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen transition-all duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
    
        <h1 className="flex items-center space-x-3 text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Stethoscope className="text-white" size={18} />
          </div>
          <span>Care Link Doctors</span>
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <UserPlus size={20} /> Add Doctor
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          Loading doctors...
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-md bg-white/90">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-200 to-blue-100">
              <tr>
                <th className="p-4 text-left font-semibold text-blue-900 uppercase tracking-wide">
                  Name
                </th>
                <th className="p-4 text-left font-semibold text-blue-900 uppercase tracking-wide">
                  Email
                </th>
                <th className="p-4 text-left font-semibold text-blue-900 uppercase tracking-wide">
                  Specialty
                </th>
                <th className="p-4 text-left font-semibold text-blue-900 uppercase tracking-wide">
                  Phone
                </th>
                <th className="p-4 text-left font-semibold text-blue-900 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, index) => (
                <tr
                  key={doc._id}
                  className="border-t hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="p-4 font-medium text-blue-900">
                    {doc.user?.name || "-"}
                  </td>
                  <td className="p-4 text-gray-600">{doc.user?.email || "-"}</td>
                  <td className="p-4 text-blue-600 font-semibold">
                    {doc.specialty || "-"}
                  </td>
                  <td className="p-4 text-blue-900">{doc.user?.phone || "-"}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDoctor(doc);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.user?._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL (SLIDE-UP ANIMATION) */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-950/30 flex justify-center items-end md:items-center z-50 transition-opacity duration-300 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl w-[95%] md:w-3/4 lg:w-1/2 relative p-8 animate-[slideUp_0.4s_ease-out]"
            style={{
              animationName: "slideUp",
              animationDuration: "0.4s",
              animationTimingFunction: "ease-out",
            }}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setEditingDoctor(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-800 transition-all"
            >
              ✕
            </button>

            {editingDoctor ? (
              <DoctorForm
                doctor={editingDoctor}
                onClose={(refresh) => {
                  setShowModal(false);
                  setEditingDoctor(null);
                  if (refresh) fetchDoctors();
                }}
              />
            ) : (
              <AddDoctorForm
                onClose={() => {
                  setShowModal(false);
                  fetchDoctors();
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* CUSTOM SLIDE-UP ANIMATION */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

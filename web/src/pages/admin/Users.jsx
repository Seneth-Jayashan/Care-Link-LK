import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Search, Eye } from "lucide-react";
import api from "../../api/api";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <div className="p-4 rounded-xl bg-red-50 text-red-700">Access denied</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users />
          <h1 className="text-3xl font-bold">All Users</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, role"
              className="w-full pl-9 pr-3 py-2 border rounded-xl"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading users...</div>
        ) : error ? (
          <div className="py-4 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-3">{u.name || "-"}</td>
                    <td className="p-3">{u.email || "-"}</td>
                    <td className="p-3">{u.phone || "-"}</td>
                    <td className="p-3 capitalize">{u.role || "-"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-xl"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">User Information</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Name" value={selectedUser.name} />
              <Info label="Email" value={selectedUser.email} />
              <Info label="Phone" value={selectedUser.phone} />
              <Info label="Role" value={selectedUser.role} />
              <Info label="Gender" value={selectedUser.gender} />
              <Info label="Address" value={selectedUser.address} />
            </div>

            {selectedUser.hospital && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Hospital</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Name" value={selectedUser.hospital?.name} />
                  <Info label="Location" value={selectedUser.hospital?.location} />
                </div>
              </div>
            )}

            {selectedUser.doctorDetails && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Doctor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Specialization" value={selectedUser.doctorDetails?.specialization} />
                  <Info label="License Number" value={selectedUser.doctorDetails?.licenseNumber} />
                </div>
              </div>
            )}

            {selectedUser.patientHistory && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Patient History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Blood Type" value={selectedUser.patientHistory?.bloodType} />
                  <Info label="Allergies" value={(selectedUser.patientHistory?.allergies || []).join(", ")} />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-gray-200 rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-3 bg-gray-50">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-gray-800 break-words">{value || "-"}</div>
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Stethoscope, 
  HeartPulse, 
  TrendingUp,
  Activity,
  Trash2,
  Edit,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';

export default function HospitalAdminManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalHospitals: 0,
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, user: null });

  // Fetch stats and users
  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/users');
      const users = res.data;

      const totalUsers = users.length;
      const totalHospitalAdmins = users.filter(u => u.role === 'hospitaladmin').length;
      const totalDoctors = users.filter(u => u.role === 'doctor').length;
      const totalPatients = users.filter(u => u.role === 'patient').length;
      const totalHospitals = totalHospitalAdmins; // 1 hospital per admin assumption

      setStats({ totalUsers, totalHospitalAdmins, totalDoctors, totalPatients, totalHospitals });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/edit-hospital-manager/${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setMessage('✅ User deleted successfully!');
      fetchUsers();
      setDeleteConfirm({ show: false, user: null });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setMessage(`❌ Error deleting user: ${errorMsg}`);
      setDeleteConfirm({ show: false, user: null });
    }
  };

  const handleAdd = () => {
    navigate('/admin/add-hospital-manager');
  };

  // Filter users based on search term
  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Access Denied
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only administrators can manage hospital admins.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Hospital Admins', value: stats.totalHospitalAdmins, icon: Building2, color: 'bg-green-500', change: '+5%' },
    { title: 'Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'bg-purple-500', change: '+8%' },
    { title: 'Patients', value: stats.totalPatients, icon: HeartPulse, color: 'bg-red-500', change: '+15%' },
    { title: 'Hospitals', value: stats.totalHospitals, icon: Building2, color: 'bg-indigo-500', change: '+3%' },
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">Hospital Admin Management</h1>
            <p className="text-blue-600 mt-2 text-lg">Manage all hospital administrators</p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow hover:shadow-md transition"
          >
            <Building2 size={20} /> Add Admin
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-blue-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-white to-blue-50 border border-blue-200`}>
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
                  <span className="text-sm text-emerald-700 font-semibold">{stat.change}</span>
                  <span className="text-sm text-blue-600 ml-1">from last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <table className="w-full border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(u._id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow hover:shadow-md"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, user: u })}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-white bg-gradient-to-r from-red-600 to-rose-500 shadow hover:shadow-md"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm({ show: false, user: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
                  <Trash2 className="text-white" size={20} />
                  <h3 className="text-white text-lg font-bold">Delete User</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-blue-900 mb-6">
                    Are you sure you want to delete <strong>{deleteConfirm.user?.name}</strong>?
                    This will permanently remove their access and all associated data.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirm({ show: false, user: null })}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm.user?._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-red-600 to-rose-500 shadow hover:shadow-md"
                    >
                      <Trash2 size={16} /> Delete User
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

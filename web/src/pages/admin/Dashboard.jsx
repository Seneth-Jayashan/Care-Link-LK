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

  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, admin: null });

  // Fetch stats and admins
  useEffect(() => {
    fetchDashboardStats();
    fetchHospitalAdmins();
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

  // Fetch hospital admins
  const fetchHospitalAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?role=hospitaladmin');
      setHospitalAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch hospital admins:', err);
      setError('Failed to load hospital admins');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (adminId) => {
    navigate(`/admin/edit-hospital-manager/${adminId}`);
  };

  const handleDelete = async (adminId) => {
    try {
      await api.delete(`/users/${adminId}`);
      setMessage('✅ Hospital admin deleted successfully!');
      fetchHospitalAdmins();
      setDeleteConfirm({ show: false, admin: null });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setMessage(`❌ Error deleting admin: ${errorMsg}`);
      setDeleteConfirm({ show: false, admin: null });
    }
  };

  const handleAdd = () => {
    navigate('/admin/add-hospital-manager');
  };

  // Filter admins based on search term
  const filteredAdmins = hospitalAdmins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Admin Management</h1>
            <p className="text-gray-600 mt-1">Manage all hospital administrators</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <Building2 size={20} /> Add Admin
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-500 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            placeholder="Search hospital admins..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-2 border rounded-lg"
          />

          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => (
                <tr key={admin._id} className="border-t">
                  <td className="p-3">{admin.name}</td>
                  <td className="p-3">{admin.email}</td>
                  <td className="p-3">{admin.phone}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(admin._id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-xl flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, admin })}
                      className="px-3 py-1 bg-red-500 text-white rounded-xl flex items-center gap-1"
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm({ show: false, admin: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Hospital Admin</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{deleteConfirm.admin?.name}</strong>?
                  This will permanently remove their admin access and all associated data.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, admin: null })}
                    className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.admin?._id)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Admin
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

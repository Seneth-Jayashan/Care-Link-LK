import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Edit3,
  Trash2,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import api from '../../api/api';

export default function HospitalAdminManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, admin: null });

  useEffect(() => {
    fetchHospitalAdmins();
  }, []);

  const fetchHospitalAdmins = async () => {
    try {
      const response = await api.get('/users');
      // Filter only hospital admins
      const admins = response.data.filter(user => user.role === 'hospitaladmin');
      setHospitalAdmins(admins);
    } catch (err) {
      console.error('Error fetching hospital admins:', err);
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
      fetchHospitalAdmins(); // Refresh the list
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

  const filteredAdmins = hospitalAdmins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Access Denied Component
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700">Loading Hospital Admins</h3>
          <p className="text-gray-500 mt-2">Please wait while we fetch the data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hospital Admin Management</h1>
                <p className="text-blue-100">Manage hospital administrators and their access</p>
              </div>
            </div>

            <motion.button
              onClick={handleAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
            >
              <UserPlus size={20} />
              Add Hospital Admin
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search admins by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-gray-700">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {/* Admins Table */}
          {filteredAdmins.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching admins found' : 'No Hospital Admins'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Get started by adding your first hospital administrator to manage hospital operations.'
                }
              </p>
              {!searchTerm && (
                <motion.button
                  onClick={handleAdd}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2 mx-auto"
                >
                  <UserPlus size={18} />
                  Add First Hospital Admin
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-blue-50 text-blue-700">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold">Admin</th>
                    <th className="py-4 px-6 text-left font-semibold">Contact</th>
                    <th className="py-4 px-6 text-left font-semibold">Created</th>
                    <th className="py-4 px-6 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <motion.tr
                      key={admin._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span>{admin.phone || 'Not provided'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(admin._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Admin"
                          >
                            <Edit3 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm({ show: true, admin })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Admin"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Summary */}
          {filteredAdmins.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-gray-50 rounded-xl"
            >
              <p className="text-sm text-gray-600 text-center">
                Showing {filteredAdmins.length} of {hospitalAdmins.length} hospital administrators
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

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
                  <Trash2 size={16} />
                  Delete Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { Trash2, Building2, Mail, Phone, User, AlertCircle, CheckCircle, Search, Users, AlertTriangle } from 'lucide-react';

const DeleteHospitalManager = () => {
  const { api } = useAuth();
  const [hospitalManagers, setHospitalManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch hospital managers on component mount
  useEffect(() => {
    fetchHospitalManagers();
  }, []);

  const fetchHospitalManagers = async () => {
    try {
      setFetching(true);
      const response = await api.get('/users');
      const managers = response.data.filter(user => user.role === 'hospitaladmin');
      setHospitalManagers(managers);
    } catch (error) {
      console.error('Error fetching hospital managers:', error);
      setMessage({
        type: 'error',
        text: 'Failed to fetch hospital managers'
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredManagers = hospitalManagers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectManager = (manager) => {
    setSelectedManager(manager);
    setMessage({ type: '', text: '' });
  };

  const handleDeleteClick = () => {
    if (!selectedManager) {
      setMessage({
        type: 'error',
        text: 'Please select a hospital manager to delete'
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedManager) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.delete(`/users/${selectedManager._id}`);

      setMessage({
        type: 'success',
        text: 'Hospital Manager deleted successfully!'
      });

      // Remove from local state
      setHospitalManagers(prev => 
        prev.filter(manager => manager._id !== selectedManager._id)
      );

      // Reset selection
      setSelectedManager(null);
      setShowConfirmDialog(false);

    } catch (error) {
      console.error('Error deleting hospital manager:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete hospital manager'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const handleReset = () => {
    setSelectedManager(null);
    setMessage({ type: '', text: '' });
    setShowConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delete Hospital Manager</h1>
              <p className="text-gray-600">Remove hospital administrator accounts</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="mr-2" size={20} />
              ) : (
                <AlertCircle className="mr-2" size={20} />
              )}
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Hospital Managers List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                Select Hospital Manager
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Managers List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {fetching ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading hospital managers...</p>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Building2 className="mx-auto mb-2" size={32} />
                    <p>No hospital managers found</p>
                  </div>
                ) : (
                  filteredManagers.map((manager) => (
                    <motion.div
                      key={manager._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSelectManager(manager)}
                      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                        selectedManager?._id === manager._id
                          ? 'bg-red-50 border-red-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <User className="text-red-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{manager.name}</h3>
                          <p className="text-sm text-gray-600">{manager.email}</p>
                          <p className="text-sm text-gray-500">{manager.phone}</p>
                        </div>
                        {selectedManager?._id === manager._id && (
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Delete Confirmation */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trash2 className="mr-2" size={20} />
                Delete Confirmation
              </h2>

              {selectedManager ? (
                <div className="space-y-6">
                  {/* Selected Manager Info */}
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <User className="text-red-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedManager.name}</h3>
                        <p className="text-sm text-gray-600">Hospital Manager</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 text-gray-500" size={16} />
                        <span className="text-gray-700">{selectedManager.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 text-gray-500" size={16} />
                        <span className="text-gray-700">{selectedManager.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Warning</h4>
                        <p className="text-sm text-yellow-700">
                          This action cannot be undone. Deleting this hospital manager will permanently 
                          remove their account and all associated data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleDeleteClick}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2" size={20} />
                          Delete Manager
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleReset}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trash2 className="mx-auto mb-4" size={48} />
                  <p>Select a hospital manager from the list to delete their account</p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete the hospital manager:
                  </p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedManager?.name}</p>
                    <p className="text-sm text-gray-600">{selectedManager?.email}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    onClick={handleConfirmDelete}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </motion.button>

                  <motion.button
                    onClick={handleCancelDelete}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <Trash2 className="text-red-600 mr-3 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-900 mb-1">Delete Hospital Manager</h3>
                <p className="text-sm text-red-700">
                  This will permanently delete the selected hospital manager account. 
                  All associated data will be removed and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeleteHospitalManager;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { Edit3, Building2, Mail, Phone, User, AlertCircle, CheckCircle, Search, Users } from 'lucide-react';

const EditHospitalManager = () => {
  const { api } = useAuth();
  const [hospitalManagers, setHospitalManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

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
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedManager) {
      setMessage({
        type: 'error',
        text: 'Please select a hospital manager to edit'
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put(`/users/${selectedManager._id}`, {
        ...formData,
        role: 'hospitaladmin'
      });

      setMessage({
        type: 'success',
        text: 'Hospital Manager updated successfully!'
      });

      // Update the local state
      setHospitalManagers(prev => 
        prev.map(manager => 
          manager._id === selectedManager._id 
            ? { ...manager, ...formData }
            : manager
        )
      );

      // Update selected manager
      setSelectedManager(prev => ({ ...prev, ...formData }));

    } catch (error) {
      console.error('Error updating hospital manager:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update hospital manager'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedManager(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <Edit3 className="text-orange-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Hospital Manager</h1>
              <p className="text-gray-600">Update hospital administrator information</p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Managers List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {fetching ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{manager.name}</h3>
                          <p className="text-sm text-gray-600">{manager.email}</p>
                          <p className="text-sm text-gray-500">{manager.phone}</p>
                        </div>
                        {selectedManager?._id === manager._id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Edit3 className="mr-2" size={20} />
                Edit Information
              </h2>

              {selectedManager ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline mr-2" size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit3 className="mr-2" size={20} />
                          Update Manager
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleReset}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Edit3 className="mx-auto mb-4" size={48} />
                  <p>Select a hospital manager from the list to edit their information</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start">
              <Edit3 className="text-orange-600 mr-3 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">Edit Hospital Manager</h3>
                <p className="text-sm text-orange-700">
                  Select a hospital manager from the list and update their information. 
                  Changes will be saved immediately upon submission.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditHospitalManager;

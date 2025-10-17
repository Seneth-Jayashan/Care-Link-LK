import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';

const Edit = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'hospitaladmin'
  });

  useEffect(() => {
    console.log('Edit component mounted with ID:', id);
    if (id) {
      fetchHospitalAdmin();
    } else {
      console.error('No ID provided to Edit component');
      setError('No user ID provided');
      setInitialLoading(false);
    }
  }, [id]);

  const fetchHospitalAdmin = async () => {
    try {
      console.log('Current user:', user);
      console.log('Fetching user with ID:', id);
      console.log('Auth token available:', !!localStorage.getItem('authUser'));
      
      const response = await api.get(`/users/${id}`);
      console.log('API Response:', response.data);
      const adminData = response.data;
      setFormData({
        name: adminData.name || '',
        email: adminData.email || '',
        phone: adminData.phone || '',
        role: adminData.role || 'hospitaladmin'
      });
    } catch (err) {
      console.error('Error fetching hospital admin:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to load hospital admin data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put(`/users/${id}`, formData);
      setMessage('Hospital admin updated successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Error updating hospital admin:', err);
      setError(err.response?.data?.message || 'Failed to update hospital admin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-blue-700">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading hospital admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight mb-6">Edit Hospital Admin</h1>
          
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>


            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Hospital Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
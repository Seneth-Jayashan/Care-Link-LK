import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';

const Delete = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospitalAdmin, setHospitalAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchHospitalAdmin();
  }, [id]);

  const fetchHospitalAdmin = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setHospitalAdmin(response.data);
    } catch (err) {
      console.error('Error fetching hospital admin:', err);
      setError('Failed to load hospital admin data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.delete(`/users/${id}`);
      setMessage('Hospital admin deleted successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Error deleting hospital admin:', err);
      setError(err.response?.data?.message || 'Failed to delete hospital admin');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading hospital admin data...</p>
        </div>
      </div>
    );
  }

  if (!hospitalAdmin) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Hospital Admin Not Found</h2>
          <p className="text-blue-700 mb-4">The hospital admin you're looking for doesn't exist.</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow hover:shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-700 to-rose-500 bg-clip-text text-transparent tracking-tight mb-6">Delete Hospital Admin</h1>
          
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

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">Warning</h3>
                <p className="text-red-700">This action cannot be undone. This will permanently delete the hospital admin account.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Admin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{hospitalAdmin.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{hospitalAdmin.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{hospitalAdmin.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{hospitalAdmin.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(hospitalAdmin.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {!confirmDelete ? (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-red-600 to-rose-500 shadow hover:shadow-md"
              >
                Delete Hospital Admin
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-red-800 mb-4">Confirm Deletion</h4>
              <p className="text-red-700 mb-4">
                Are you absolutely sure you want to delete <strong>{hospitalAdmin.name}</strong>? 
                This action cannot be undone and will permanently remove all associated data.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-red-600 to-rose-500 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Delete;
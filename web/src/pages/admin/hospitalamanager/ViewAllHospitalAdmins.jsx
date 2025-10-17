import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react';
import api from '../../../api/api';

export default function ViewAllHospitalAdmins() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = (adminId) => {
    navigate(`/admin/delete-hospital-manager/${adminId}`);
  };

  const handleAdd = () => {
    navigate('/admin/add-hospital-manager');
  };

  // Filter hospital admins based on search term
  const filteredAdmins = hospitalAdmins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading hospital admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight flex items-center">
                <Building2 className="mr-3 h-8 w-8 text-blue-600" /> Hospital Administrators
              </h1>
              <p className="text-blue-600 mt-2 text-lg">Manage all hospital administrators in the system</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hospital Admin
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search hospital admins by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAdmins.length} of {hospitalAdmins.length} hospital administrators
            </p>
          </div>

          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching hospital admins found' : 'No hospital admins found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by adding your first hospital administrator'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Hospital Admin
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.phone || 'Not provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.hospital?.name || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(admin._id)}
                            className="text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-1 rounded flex items-center shadow"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="text-white bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 px-3 py-1 rounded flex items-center shadow"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '../../api/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all users to calculate stats
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalHospitalAdmins = users.filter(u => u.role === 'hospitaladmin').length;
      const totalDoctors = users.filter(u => u.role === 'doctor').length;
      const totalPatients = users.filter(u => u.role === 'patient').length;
      
      // Mock data for other stats (replace with actual API calls when available)
      const totalHospitals = totalHospitalAdmins; // Assuming 1 hospital per admin
      

      setStats({
        totalUsers,
        totalHospitalAdmins,
        totalDoctors,
        totalPatients,
        totalHospitals
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Hospital Admins',
      value: stats.totalHospitalAdmins,
      icon: Building2,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Patients',
      value: stats.totalPatients,
      icon: HeartPulse,
      color: 'bg-red-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Hospitals',
      value: stats.totalHospitals,
      icon: Building2,
      color: 'bg-indigo-500',
      change: '+3%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of the Care Link system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/hospital-managers')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Hospital Admins</h3>
              <p className="text-sm text-gray-600">View and manage hospital administrators</p>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage all system users</p>
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system-wide settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
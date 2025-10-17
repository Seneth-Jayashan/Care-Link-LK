import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope, 
  TrendingUp, 
  DollarSign,
  FileText,
  MessageCircle,
  UserCheck,
  ArrowRight,
  Star,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    doctor: null,
    stats: {
      totalAppointments: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      totalPatients: 0,
      monthlyEarnings: 0,
      satisfactionRate: 0
    },
    upcomingAppointments: [],
    recentPatients: [],
    weeklySchedule: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch doctor details first
        let doctorData = null;
        if (user && user.id) {
          try {
            const doctorRes = await api.get(`/doctors/user/${user.id}`);
            doctorData = doctorRes.data;
          } catch (error) {
            console.error("Error fetching doctor data:", error);
            // If doctor not found, use basic user info
            doctorData = {
              user: user,
              specialty: "General Practitioner"
            };
          }
        }

        // Fetch appointments for this doctor
        const appointmentsRes = await api.get('/appointments');
        const allAppointments = appointmentsRes.data;
        
        const now = new Date();
        const today = new Date().toISOString().split('T')[0];
        
        // Filter doctor's appointments - assuming appointments have doctor field
        const doctorAppointments = allAppointments.filter(app => 
          app.doctor && app.doctor._id === doctorData?._id
        );
        
        const todayAppointments = doctorAppointments.filter(app => 
          app.appointmentDate.split('T')[0] === today
        );
        
        const upcomingAppointments = doctorAppointments.filter(app => {
          const appDate = new Date(`${app.appointmentDate.split('T')[0]}T${app.appointmentTime}`);
          return appDate >= now;
        }).slice(0, 5);

        // Get unique patients
        const uniquePatients = [...new Map(doctorAppointments.map(app => 
          [app.patient._id, app.patient]
        ).values())];

        // Calculate monthly earnings (mock calculation based on consultation fee)
        const monthlyEarnings = doctorAppointments.reduce((total, app) => {
          if (app.paymentStatus === 'paid') {
            return total + (doctorData?.consultationFee || 2000);
          }
          return total;
        }, 0);

        // Mock weekly schedule data
        const weeklySchedule = [
          { day: 'Monday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 1).length 
          },
          { day: 'Tuesday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 2).length 
          },
          { day: 'Wednesday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 3).length 
          },
          { day: 'Thursday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 4).length 
          },
          { day: 'Friday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 5).length 
          },
          { day: 'Saturday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 6).length 
          },
          { day: 'Sunday', appointments: doctorAppointments.filter(app => 
            new Date(app.appointmentDate).getDay() === 0).length 
          }
        ];

        setDashboardData({
          doctor: doctorData,
          stats: {
            totalAppointments: doctorAppointments.length,
            todayAppointments: todayAppointments.length,
            pendingAppointments: doctorAppointments.filter(app => app.status === 'pending').length,
            totalPatients: uniquePatients.length,
            monthlyEarnings: monthlyEarnings,
            satisfactionRate: doctorData?.rating || 4.7
          },
          upcomingAppointments: upcomingAppointments,
          recentPatients: uniquePatients.slice(0, 4),
          weeklySchedule: weeklySchedule
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const StatCard = ({ icon: Icon, label, value, change, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-lg cursor-pointer transition-all duration-300 ${onClick ? 'hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-sm font-semibold mb-2">{label}</p>
          <p className="text-3xl font-bold text-blue-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-blue-600" size={24} />
        </div>
      </div>
    </motion.div>
  );

  const QuickAction = ({ icon: Icon, label, description, onClick, color }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-lg text-left hover:shadow-xl transition-all duration-300 w-full"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 text-lg mb-1">{label}</h3>
          <p className="text-blue-600 text-sm">{description}</p>
        </div>
        <ArrowRight className="text-blue-400 mt-2" size={20} />
      </div>
    </motion.button>
  );

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-blue-600 mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
                Doctor Dashboard
              </h1>
              <p className="text-blue-600 text-lg mt-2">Welcome back! Here's your practice overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-blue-900 font-semibold">
                  Dr. {dashboardData.doctor?.user?.name || user?.name || 'Doctor'}
                </p>
                <p className="text-blue-600 text-sm">
                  {dashboardData.doctor?.specialty || 'Medical Professional'}
                </p>
                {dashboardData.doctor?.yearsOfExperience && (
                  <p className="text-blue-500 text-xs">
                    {dashboardData.doctor.yearsOfExperience} years experience
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-300">
                {dashboardData.doctor?.user?.profileImage ? (
                  <img 
                    src={`http://localhost:3001/${dashboardData.doctor.user.profileImage.replace(/\\/g, "/")}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <UserCheck className="text-blue-600" size={24} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={Calendar}
            label="Today's Appointments"
            value={dashboardData.stats.todayAppointments}
            change={12}
            color="bg-blue-100"
            onClick={() => navigate('/doctor/appointments')}
          />
          <StatCard
            icon={Users}
            label="Total Patients"
            value={dashboardData.stats.totalPatients}
            change={8}
            color="bg-green-100"
            onClick={() => navigate('/doctor/patients')}
          />
          <StatCard
            icon={Clock}
            label="Pending Appointments"
            value={dashboardData.stats.pendingAppointments}
            change={-5}
            color="bg-orange-100"
            onClick={() => navigate('/doctor/appointments?filter=pending')}
          />
          <StatCard
            icon={DollarSign}
            label="Monthly Earnings"
            value={`LKR ${dashboardData.stats.monthlyEarnings.toLocaleString()}`}
            change={15}
            color="bg-purple-100"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Appointments & Quick Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg"
            >
              <div className="p-6 border-b border-blue-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={24} />
                  Today's Appointments
                </h2>
                <button 
                  onClick={() => navigate('/doctor/appointments')}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  View All
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {dashboardData.upcomingAppointments.length > 0 ? (
                  dashboardData.upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <UserCheck className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            {appointment.patient?.name || 'Patient'}
                          </h3>
                          <p className="text-blue-600 text-sm">
                            {appointment.appointmentTime} • {appointment.reason}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                            {appointment.paymentStatus && (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                appointment.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {appointment.paymentStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-semibold"
                      >
                        View
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto text-blue-400" size={48} />
                    <p className="text-blue-600 mt-4">No appointments scheduled for today</p>
                    <button
                      onClick={() => navigate('/doctor/schedule')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold"
                    >
                      Manage Schedule
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAction
                  icon={Calendar}
                  label="Schedule Manager"
                  description="Manage your availability and appointments"
                  onClick={() => navigate('/doctor/schedule')}
                  color="bg-blue-100"
                />
                <QuickAction
                  icon={FileText}
                  label="Patient Records"
                  description="Access and update patient medical records"
                  onClick={() => navigate('/doctor/patients')}
                  color="bg-green-100"
                />
                <QuickAction
                  icon={MessageCircle}
                  label="Messages"
                  description="Communicate with your patients"
                  onClick={() => navigate('/doctor/messages')}
                  color="bg-purple-100"
                />
                <QuickAction
                  icon={Stethoscope}
                  label="Medical Charts"
                  description="Review patient charts and diagnostics"
                  onClick={() => navigate('/doctor/charts')}
                  color="bg-orange-100"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Recent Patients & Weekly Schedule */}
          <div className="space-y-8">
            {/* Recent Patients */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg"
            >
              <div className="p-6 border-b border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Users className="text-blue-600" size={24} />
                  Recent Patients
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {dashboardData.recentPatients.length > 0 ? (
                  dashboardData.recentPatients.map((patient, index) => (
                    <motion.div
                      key={patient._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                        <UserCheck className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 text-sm">
                          {patient.name}
                        </h3>
                        <p className="text-blue-600 text-xs">
                          {patient.email || 'No contact info'}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-blue-400" size={48} />
                    <p className="text-blue-600 mt-4">No recent patients</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Weekly Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg"
            >
              <div className="p-6 border-b border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  Weekly Schedule
                </h2>
              </div>
              
              <div className="p-6 space-y-3">
                {dashboardData.weeklySchedule.map((day, index) => (
                  <div key={day.day} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="font-medium text-blue-900 text-sm">{day.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-semibold">{day.appointments}</span>
                      <span className="text-blue-400 text-xs">appointments</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Satisfaction Rate */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-lg p-6 text-white"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star size={24} fill="currentColor" />
                Patient Satisfaction
              </h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">{dashboardData.stats.satisfactionRate}</span>
                <span className="text-blue-100">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= Math.floor(dashboardData.stats.satisfactionRate) ? 'text-yellow-400 fill-current' : 'text-blue-200'}`}
                  />
                ))}
              </div>
              <p className="text-blue-100 text-sm">
                Based on {dashboardData.stats.totalPatients} patient visits
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  TrendingUp,
  Bell,
  FileText,
  Shield,
  ArrowRight,
  Heart,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments and populate doctor details
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/appointments');

        const populatedAppointments = await Promise.all(
          res.data.map(async app => {
            if (app.doctor && !app.doctor.doctorDetails) {
              const doctorRes = await api.get(`/doctors/user/${app.doctor._id}`);
              app.doctor.doctorDetails = doctorRes.data;
            }
            return app;
          })
        );

        setAppointments(populatedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Split into upcoming and past appointments
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(app => {
      const appDate = new Date(`${app.appointmentDate.split('T')[0]}T${app.appointmentTime}`);
      if (appDate >= now) upcoming.push(app);
      else past.push(app);
    });

    upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    return { upcoming, past };
  }, [appointments]);

  // Calculate stats and recent doctors
  useEffect(() => {
    const uniqueDoctors = [...new Map(appointments.map(app => [app.doctor._id, app.doctor]).values())].slice(0, 3);
    setRecentDoctors(uniqueDoctors);
    setUpcomingAppointments(upcoming.slice(0, 3));
  }, [appointments, upcoming]);

  const stats = {
    totalAppointments: appointments.length,
    upcomingAppointments: upcoming.length,
    completedAppointments: past.length,
    doctorsVisited: [...new Set(appointments.map(app => app.doctor?._id))].length
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-lg cursor-pointer transition-all duration-300 ${onClick ? 'hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-sm font-semibold mb-2">{label}</p>
          <p className="text-3xl font-bold text-blue-900">{value}</p>
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
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
          <p className="text-blue-600 mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 p-8 max-w-md w-full">
          <AlertCircle className="mx-auto text-red-500" size={64} />
          <h3 className="mt-6 text-2xl font-bold text-red-800">An Error Occurred</h3>
          <p className="text-red-600 mt-4 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-blue-600 text-lg mt-2">Here's your health overview</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard icon={Calendar} label="Total Appointments" value={stats.totalAppointments} color="bg-blue-100" onClick={() => navigate('/my-appointments')} />
          <StatCard icon={Clock} label="Upcoming" value={stats.upcomingAppointments} color="bg-green-100" onClick={() => navigate('/my-appointments')} />
          <StatCard icon={User} label="Doctors Visited" value={stats.doctorsVisited} color="bg-purple-100" />
          <StatCard icon={TrendingUp} label="Completed" value={stats.completedAppointments} color="bg-orange-100" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments Preview */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg">
              <div className="p-6 border-b border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  Upcoming Appointments
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingAppointments.length ? upcomingAppointments.map((app, i) => (
                  <motion.div key={app._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Dr. {app.doctor?.user?.name || 'Unknown'}</h3>
                        <p className="text-blue-600 text-sm">{app.appointmentDate} • {app.appointmentTime}</p>
                        <p className="text-blue-500 text-xs">{app.doctor?.specialty || 'General Practitioner'}</p>
                      </div>
                    </div>
                    <button onClick={() => navigate('/my-appointments')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-semibold">
                      View
                    </button>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto text-blue-400" size={48} />
                    <p className="text-blue-600 mt-4">No upcoming appointments</p>
                    <button onClick={() => navigate('/doctors')} className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold">
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAction icon={Stethoscope} label="Find Doctors" description="Book appointments with specialists" onClick={() => navigate('/doctors')} color="bg-blue-100" />
                <QuickAction icon={FileText} label="Medical Records" description="View your health history" onClick={() => navigate('/medical-records')} color="bg-green-100" />
                <QuickAction icon={Bell} label="Appointments" description="Manage your bookings" onClick={() => navigate('/my-appointments')} color="bg-purple-100" />
                <QuickAction icon={Shield} label="Insurance" description="Check coverage and claims" onClick={() => navigate('/insurance')} color="bg-orange-100" />
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Doctors */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg">
              <div className="p-6 border-b border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <User className="text-blue-600" size={24} />
                  Recent Doctors
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {recentDoctors.length ? recentDoctors.map((doctor, i) => (
                  <motion.div key={doctor._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate(`/doctors/${doctor._id}`)}>
                    <img src={doctor.user?.profileImage ? `http://localhost:3001/${doctor.user.profileImage.replace(/\\/g, '/')}` : '/default-avatar.png'} alt={doctor.user?.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-300" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm">Dr. {doctor.user?.name}</h3>
                      <p className="text-blue-600 text-xs">{doctor.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="text-yellow-400" size={12} fill="currentColor" />
                        <span className="text-blue-500 text-xs">{doctor.rating || 4.5}</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <User className="mx-auto text-blue-400" size={48} />
                    <p className="text-blue-600 mt-4">No recent doctors</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Health Tip */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart size={24} />Health Tip</h2>
              <p className="text-blue-100 mb-4">
                Regular health check-ups can help detect potential health issues early. Stay proactive about your health!
              </p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

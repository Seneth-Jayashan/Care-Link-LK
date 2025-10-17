import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import {
  Calendar,
  Clock,
  User,
  TrendingUp,
  Bell,
  FileText,
  Shield,
  ArrowRight,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Categorize appointments
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(app => {
      const appDate = new Date(app.appointmentDate);
      if (appDate >= now) upcoming.push(app);
      else past.push(app);
    });

    upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    return { upcoming, past };
  }, [appointments]);

  const stats = {
    total: appointments.length,
    upcoming: upcoming.length,
    completed: past.length,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <AlertCircle className="text-red-500" size={64} />
        <p className="mt-6 text-red-700 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-blue-600 mt-2 text-lg">Here’s your appointment overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <StatCard icon={Calendar} label="Total Appointments" value={stats.total} color="bg-blue-100" />
          <StatCard icon={Clock} label="Upcoming" value={stats.upcoming} color="bg-green-100" />
          <StatCard icon={TrendingUp} label="Completed" value={stats.completed} color="bg-orange-100" />
        </div>

        {/* Upcoming Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-white/90 rounded-2xl border border-blue-100 shadow-lg">
          <div className="p-6 border-b border-blue-200 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-blue-900">Upcoming Appointments</h2>
          </div>
          <div className="p-6 space-y-4">
            {upcoming.length ? (
              upcoming.slice(0, 4).map(app => (
                <div key={app._id} className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <p className="font-semibold text-blue-900">Dr. {app.doctor?.name || 'Unknown'}</p>
                    <p className="text-blue-600 text-sm">{new Date(app.appointmentDate).toLocaleDateString()} • {app.appointmentTime}</p>
                    <p className="text-blue-500 text-xs">{app.status}</p>
                  </div>
                  <button onClick={() => navigate(`/patient/appointments#${app._id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm">
                    View
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-blue-600 py-4">No upcoming appointments</p>
            )}
          </div>
        </motion.div>

        {/* Health Tip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl text-white p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart /> Health Tip</h2>
          <p className="text-blue-100 mb-4 text-center">Stay hydrated and take regular breaks for your physical and mental well-being.</p>  
        </motion.div>
      </div>
    </div>
  );
}

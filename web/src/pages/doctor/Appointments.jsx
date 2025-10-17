import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import DoctorAppointmentCard from '../../components/ui/DoctorAppointmentCard'; // Adjust path if needed
import { Calendar, History, Loader2, AlertCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'past'
  const [updatingId, setUpdatingId] = useState(null); // To show spinner on the specific card being updated

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // The backend automatically filters appointments for the logged-in doctor
        const res = await api.get('/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Could not load your appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      const res = await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      // Update the state locally for an immediate UI change
      setAppointments(prevApps =>
        prevApps.map(app => (app._id === appointmentId ? res.data : app))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      // Optionally show a toast notification for the error
    } finally {
      setUpdatingId(null);
    }
  };

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(app => {
      const appDate = new Date(`${app.appointmentDate.split('T')[0]}T${app.appointmentTime}`);
      if (appDate >= now && app.status !== 'completed' && app.status !== 'cancelled') {
        upcoming.push(app);
      } else {
        past.push(app);
      }
    });

    upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  const displayedAppointments = viewMode === 'upcoming' ? upcomingAppointments : pastAppointments;

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
          <p className="text-blue-600 mt-4 text-lg">Loading your appointments...</p>
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
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
            My Patient Appointments
          </h1>
          <p className="text-blue-600 mt-2 text-lg">Manage upcoming and past appointments</p>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 inline-flex rounded-full border border-blue-200 bg-white/70 backdrop-blur px-1 py-1 shadow-sm">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-5 py-2.5 text-sm md:text-base font-semibold rounded-full transition ${
              viewMode === 'upcoming'
                ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setViewMode('past')}
            className={`px-5 py-2.5 text-sm md:text-base font-semibold rounded-full transition ${
              viewMode === 'past'
                ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            Past & Completed ({pastAppointments.length})
          </button>
        </div>

        {/* Appointments Grid */}
        {displayedAppointments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedAppointments.map(app => (
              <DoctorAppointmentCard
                key={app._id}
                appointment={app}
                onStatusChange={handleStatusChange}
                isUpdating={updatingId === app._id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-8 text-center">
            <div className="flex justify-center">
              {viewMode === 'upcoming' ? (
                <Calendar size={64} className="text-blue-400" />
              ) : (
                <History size={64} className="text-blue-400" />
              )}
            </div>
            <h3 className="mt-4 text-xl font-bold text-blue-900">No {viewMode} appointments</h3>
            <p className="mt-1 text-blue-600">You have no {viewMode} appointments in your schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
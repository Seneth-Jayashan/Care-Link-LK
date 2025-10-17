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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 rounded-lg">
        <AlertCircle className="mx-auto text-red-500" size={48} />
        <h3 className="mt-4 text-xl font-semibold text-red-800">{error}</h3>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Patient Appointments</h1>

        {/* View Mode Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-6 py-3 text-lg font-semibold transition ${viewMode === 'upcoming' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setViewMode('past')}
            className={`px-6 py-3 text-lg font-semibold transition ${viewMode === 'past' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="flex justify-center">
              {viewMode === 'upcoming' ? <Calendar size={56} className="text-gray-300"/> : <History size={56} className="text-gray-300"/>}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">
              No {viewMode} appointments
            </h3>
            <p className="mt-1 text-gray-500">You have no {viewMode} appointments in your schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
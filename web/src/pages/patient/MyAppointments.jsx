import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import AppointmentCard from '../../components/ui/AppointmentCard'; // Adjust path if needed
import { Calendar, History, Loader2, AlertCircle, Clock, User } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // This endpoint gets appointments filtered by the logged-in user (based on your backend logic)
        const res = await api.get('/appointments');

        console.log(res);
        
        // Populate doctorDetails if it's not already
        const populatedAppointments = res.data.map(async (app) => {
            if (app.doctor && !app.doctor.doctorDetails) {
                const doctorRes = await api.get(`/doctors/user/${app.doctor._id}`);
                app.doctor.doctorDetails = doctorRes.data;
            }
            return app;
        });

        setAppointments(await Promise.all(populatedAppointments));
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Could not load your appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(app => {
      const appDate = new Date(`${app.appointmentDate.split('T')[0]}T${app.appointmentTime}`);
      if (appDate >= now) {
        upcoming.push(app);
      } else {
        past.push(app);
      }
    });

    // Sort upcoming by soonest, and past by most recent
    upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

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
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen transition-all duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
            My Appointments
          </h1>
          <p className="text-blue-600 mt-2 text-lg">Manage and view your upcoming and past appointments</p>
        </div>

        {/* Upcoming Appointments Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
              <Calendar size={28} className="text-blue-600" />
              Upcoming Appointments
              {upcomingAppointments.length > 0 && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {upcomingAppointments.length}
                </span>
              )}
            </h2>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingAppointments.map(app => (
                <AppointmentCard key={app._id} appointment={app} />
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-8 text-center">
              <Clock className="mx-auto text-blue-400" size={64} />
              <h3 className="text-xl font-bold text-blue-900 mt-4">No Upcoming Appointments</h3>
              <p className="text-blue-600 mt-2">You don't have any scheduled appointments at the moment.</p>
            </div>
          )}
        </section>

        {/* Past Appointments Section */}
        <section>
          <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
              <History size={28} className="text-blue-600" />
              Past Appointments
              {pastAppointments.length > 0 && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {pastAppointments.length}
                </span>
              )}
            </h2>
          </div>
          
          {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastAppointments.map(app => (
                <AppointmentCard key={app._id} appointment={app} />
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200 p-8 text-center">
              <User className="mx-auto text-blue-400" size={64} />
              <h3 className="text-xl font-bold text-blue-900 mt-4">No Past Appointments</h3>
              <p className="text-blue-600 mt-2">Your appointment history will appear here.</p>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-900">{appointments.length}</div>
            <div className="text-blue-600 font-semibold">Total Appointments</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-900">{upcomingAppointments.length}</div>
            <div className="text-blue-600 font-semibold">Upcoming</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-900">{pastAppointments.length}</div>
            <div className="text-blue-600 font-semibold">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
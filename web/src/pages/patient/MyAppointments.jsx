import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import AppointmentCard from '../../components/ui/AppointmentCard'; // Adjust path if needed
import { Calendar, History, Loader2, AlertCircle } from 'lucide-react';

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 rounded-lg">
        <AlertCircle className="mx-auto text-red-500" size={48} />
        <h3 className="mt-4 text-xl font-semibold text-red-800">An Error Occurred</h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Appointments</h1>

        {/* Upcoming Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
            <Calendar className="text-blue-500" />
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map(app => (
                <AppointmentCard key={app._id} appointment={app} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">
              You have no upcoming appointments.
            </p>
          )}
        </section>

        {/* Past Appointments Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
            <History className="text-blue-500" />
            Past Appointments
          </h2>
          {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastAppointments.map(app => (
                <AppointmentCard key={app._id} appointment={app} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">
              You have no past appointment records.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyAppointments;
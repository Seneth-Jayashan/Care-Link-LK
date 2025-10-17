import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import AppointmentCard from '../../components/ui/AppointmentCard'; // Adjust path if needed
import { Calendar, History, Loader2, AlertCircle, Pencil, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formValues, setFormValues] = useState({ appointmentDate: '', appointmentTime: '', reason: '' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

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

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setFormValues({
      appointmentDate: appointment.appointmentDate?.split('T')[0] || '',
      appointmentTime: appointment.appointmentTime || '',
      reason: appointment.reason || ''
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingAppointment(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingAppointment) return;
    try {
      const payload = {
        appointmentDate: formValues.appointmentDate,
        appointmentTime: formValues.appointmentTime,
        reason: formValues.reason
      };
      const res = await api.put(`/appointments/${editingAppointment._id}`, payload);
      // Optimistically update local state
      setAppointments((prev) => prev.map((a) => (a._id === res.data._id ? { ...a, ...res.data } : a)));
      closeEditModal();
    } catch (err) {
      console.error('Failed to update appointment', err);
      setError('Failed to update appointment. Please try again.');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const res = await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
      setAppointments((prev) => prev.map((a) => (a._id === appointmentId ? { ...a, ...res.data } : a)));
    } catch (err) {
      console.error('Failed to cancel appointment', err);
      setError('Failed to cancel appointment. Please try again.');
    }
  };

  const openPaymentModal = (appointment) => {
    setPaymentAppointment(appointment);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentAppointment(null);
  };

  const restartPayment = (method) => {
    if (!paymentAppointment) return;
    const bookingDetails = {
      doctorId: paymentAppointment.doctor?._id,
      hospitalId: paymentAppointment.hospital?._id,
      consultationFee: paymentAppointment?.doctor?.doctorDetails?.consultationFee || 0,
    };
    const appointment = paymentAppointment;
    closePaymentModal();
    if (method === 'card') {
      navigate(`/patient/payment/${appointment._id}`, { state: { appointment, bookingDetails } });
    } else if (method === 'insurance') {
      navigate(`/patient/insurance-verification/${appointment._id}`, { state: { appointment, bookingDetails } });
    }
  };

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
                <div key={app._id} className="space-y-3">
                  <AppointmentCard appointment={app} />
                  <div className="flex gap-3">
                    {app.status === 'pending' && (
                      <button
                        onClick={() => openPaymentModal(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Confirm & Pay
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button
                        onClick={() => openEditModal(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelAppointment(app._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
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

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Appointment</h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formValues.appointmentDate}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                {editingAppointment?.doctor?.doctorDetails?.schedule?.length > 0 ? (
                  <select
                    name="appointmentTime"
                    value={formValues.appointmentTime}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select a time slot</option>
                    {editingAppointment.doctor.doctorDetails.schedule.map((slot) => (
                      <option key={slot._id || `${slot.day}-${slot.startTime}`} value={slot.startTime}>
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                    No available time slots for this doctor.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  name="reason"
                  value={formValues.reason}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe reason"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={!editingAppointment?.doctor?.doctorDetails?.schedule?.length}
                  className={`px-4 py-2 rounded-md text-white ${editingAppointment?.doctor?.doctorDetails?.schedule?.length ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm & Start Payment</h3>
            <p className="text-gray-600 mb-4">Choose a payment method to continue.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => restartPayment('card')}
                className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Pay by Card
              </button>
              <button
                onClick={() => restartPayment('insurance')}
                className="flex-1 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Use Insurance
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={closePaymentModal} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
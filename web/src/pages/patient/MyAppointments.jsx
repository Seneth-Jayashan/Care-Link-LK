import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import AppointmentCard from '../../components/ui/AppointmentCard'; // Adjust path if needed
import { Calendar, History, Loader2, AlertCircle, Pencil, XCircle, Clock, User, Wallet, ShieldCheck, CreditCard, Building, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // When navigated with a hash (e.g., /patient/appointments#<id>), scroll to that appointment
  useEffect(() => {
    if (!location.hash || appointments.length === 0) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-blue-500', 'rounded-xl');
      setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'rounded-xl'), 2000);
    }
  }, [location.hash, appointments]);

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
                <div key={app._id} id={app._id} className="space-y-3">
                  <AppointmentCard appointment={app} />
                  <div className="flex gap-3">
                    {app.status === 'pending' && (
                      <button
                        onClick={() => openPaymentModal(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md hover:shadow-lg transition"
                      >
                        <Wallet size={16}/> Confirm & Pay
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button
                        onClick={() => openEditModal(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md hover:shadow-lg transition"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelAppointment(app._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md hover:shadow-lg transition"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
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

      {editModalOpen && (
        <div className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
              <Pencil className="text-white" size={20} />
              <h3 className="text-white text-lg font-bold">Edit Appointment</h3>
            </div>
            <div className="p-6">
              <form onSubmit={submitEdit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Date</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formValues.appointmentDate}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-3 py-2 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Time Slot</label>
                    {editingAppointment?.doctor?.doctorDetails?.schedule?.length > 0 ? (
                      <select
                        name="appointmentTime"
                        value={formValues.appointmentTime}
                        onChange={handleFormChange}
                        className="w-full rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>
                          Select a time slot
                        </option>
                        {editingAppointment.doctor.doctorDetails.schedule.map((slot) => (
                          <option key={slot._id || `${slot.day}-${slot.startTime}`} value={slot.startTime}>
                            {slot.day}: {slot.startTime} - {slot.endTime}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                        No available time slots for this doctor.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    name="reason"
                    value={formValues.reason}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-3 py-2 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe reason"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!editingAppointment?.doctor?.doctorDetails?.schedule?.length}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-md transition ${
                      editingAppointment?.doctor?.doctorDetails?.schedule?.length
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 hover:shadow-lg'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
              <Wallet className="text-white" size={22} />
              <h3 className="text-white text-lg font-bold">Confirm & Start Payment</h3>
            </div>
            <div className="p-6 space-y-6">
              {paymentAppointment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100"><User className="text-blue-600" size={18}/></div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Doctor</p>
                      <p className="text-blue-900 font-bold">Dr. {paymentAppointment.doctor?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100"><Calendar className="text-blue-600" size={18}/></div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Date & Time</p>
                      <p className="text-blue-900 font-bold">{paymentAppointment.appointmentDate?.split('T')[0]} • {paymentAppointment.appointmentTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100"><Building className="text-blue-600" size={18}/></div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Hospital</p>
                      <p className="text-blue-900 font-bold">{paymentAppointment.hospital?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100"><Stethoscope className="text-blue-600" size={18}/></div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Consultation Fee</p>
                      <p className="text-blue-900 font-bold">LKR {paymentAppointment?.doctor?.doctorDetails?.consultationFee?.toLocaleString?.() || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-600">Choose a payment method to continue.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => restartPayment('card')}
                  className="group w-full rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-5 text-left shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-700"><CreditCard size={20}/></div>
                    <div>
                      <p className="font-semibold text-blue-900">Pay by Card</p>
                      <p className="text-sm text-blue-600">Secure checkout with instant confirmation</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => restartPayment('insurance')}
                  className="group w-full rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 text-left shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700"><ShieldCheck size={20}/></div>
                    <div>
                      <p className="font-semibold text-emerald-900">Use Insurance</p>
                      <p className="text-sm text-emerald-600">Verify coverage or complete co-payment</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button onClick={closePaymentModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
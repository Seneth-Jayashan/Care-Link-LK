import Appointment from '../models/Appointment.js';
import PatientHistory from '../models/PatientHistory.js';
import User from '../models/User.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Hospital from '../models/Hospital.js';

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, hospital, appointmentDate, appointmentTime, reason } = req.body;

    // Fetch patientHistory
    const patientHistory = await PatientHistory.findOne({ user: patient });
    if (!patientHistory) return res.status(404).json({ message: 'Patient history not found' });

    // Optional: fetch doctorDetails
    const doctorDetails = await DoctorDetails.findOne({ user: doctor });

    // Create appointment
    const appointment = new Appointment({
      patient,
      patientHistory: patientHistory._id,
      doctor,
      doctorDetails: doctorDetails?._id,
      hospital,
      appointmentDate,
      appointmentTime,
      reason,
      status: 'pending',
    });

    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name code')
      .populate('patientHistory')
      .populate('doctorDetails');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name code')
      .populate('patientHistory')
      .populate('doctorDetails');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

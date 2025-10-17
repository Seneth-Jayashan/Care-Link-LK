import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
    const { patient, doctor, hospital, appointmentDate, appointmentTime, reason } = req.body;
    console.log(req.body);
    // CHANGED: More robust validation
    if (!patient || !doctor || !hospital || !appointmentDate || !appointmentTime || !reason) {
        res.status(400);
        throw new Error('Please provide all required fields for the appointment.');
    }

    // CHANGED: Handle cases where PatientHistory might not exist for a new patient
    let patientHistory = await PatientHistory.findOne({ user: patient });
    if (!patientHistory) {
        // If no history, create a new one. This makes the system more resilient.
        patientHistory = new PatientHistory({ user: patient, medicalHistory: [], testResults: [] });
        await patientHistory.save();
    }
    
    const doctorDetails = await DoctorDetails.findOne({ user: doctor });

    const appointment = new Appointment({
        patient,
        patientHistory: patientHistory._id,
        doctor,
        doctorDetails: doctorDetails?._id,
        hospital,
        appointmentDate,
        appointmentTime,
        reason,
        status: 'pending', // Default status on creation
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
});


// @desc    Get appointments based on user role
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req, res) => {
    let query = {};

    // CHANGED: Role-based data filtering for security
    const { role, _id } = req.user; // Get user from authMiddleware

    if (role === 'patient') {
        query.patient = _id;
    } else if (role === 'doctor') {
        query.doctor = _id;
    } else if (role === 'hospitaladmin') {
        // Assuming hospital admin has a hospital ID associated with their user profile
        // This logic may need adjustment based on your User model
        if (!req.user.hospital) {
            res.status(403);
            throw new Error('Hospital admin is not associated with any hospital.');
        }
        query.hospital = req.user.hospital;
    }
    // Admin can see all appointments (no filter)

    const appointments = await Appointment.find(query)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .populate('hospital', 'name')
        .sort({ appointmentDate: -1 }); // Sort by most recent

    res.json(appointments);
});


// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name email phone')
        .populate({
            path: 'doctorDetails',
            select: 'specialty qualifications'
        })
        .populate('hospital', 'name')
        .populate('patientHistory');

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }
    
    // NEW: Security check to ensure users can only access their own appointments
    const { role, _id } = req.user;
    if (role !== 'admin' &&
        appointment.patient._id.toString() !== _id.toString() &&
        appointment.doctor._id.toString() !== _id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this appointment');
    }

    res.json(appointment);
});


// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // You can add more authorization logic here if needed
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updatedAppointment);
});


// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    await appointment.deleteOne(); // Use deleteOne() for Mongoose v6+
    res.json({ message: 'Appointment removed successfully' });
});
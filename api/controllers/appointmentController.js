import asyncHandler from "express-async-handler";
import Appointment from "../models/Appointment.js";
import PatientHistory from "../models/PatientHistory.js";
import DoctorDetails from "../models/DoctorDetails.js";


export const createAppointment = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied" });
  }

  // This page is for doctors, so let's assume the doctor is booking
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Only doctors can book appointments from this panel." });
  }

  const {
    patient, // This will be the patient's User ID
    hospital,
    appointmentDate,
    appointmentTime,
    reason,
  } = req.body;

  // The 'doctor' is the logged-in user
  const doctorId = req.user._id;

  if (
    !patient ||
    !hospital ||
    !appointmentDate ||
    !appointmentTime ||
    !reason
  ) {
    res.status(400);
    throw new Error("Please provide all required fields for the appointment.");
  }

  // Find PatientHistory
  let patientHistory = await PatientHistory.findOne({ user: patient });
  if (!patientHistory) {
    // This part of your logic is good!
    patientHistory = new PatientHistory({
      user: patient,
    });
    await patientHistory.save();
  }

  // Find DoctorDetails
  const doctorDetails = await DoctorDetails.findOne({ user: doctorId });
  if (!doctorDetails) {
    res.status(404);
    throw new Error("Logged-in doctor's details not found.");
  }

  const appointment = new Appointment({
    patient,
    patientHistory: patientHistory._id,
    doctor: doctorId, // Use logged-in user ID
    doctorDetails: doctorDetails._id, // Use found doctor details ID
    hospital,
    appointmentDate,
    appointmentTime,
    reason,
    status: "confirmed", // Since doctor is booking, let's auto-confirm
  });

  const createdAppointment = await appointment.save();

  // --- THIS IS THE NEW LINE YOU REQUESTED ---
  // Add the new appointment's ID to the PatientHistory.appointments array
  await PatientHistory.findByIdAndUpdate(patientHistory._id, {
    $push: { appointments: createdAppointment._id },
  });
  // ------------------------------------------

  res.status(201).json(createdAppointment);
});

export const createAppointmentByDoctor = asyncHandler(async (req, res) => {

  const {
    patient,
    hospital,
    appointmentDate,
    appointmentTime,
    reason,
  } = req.body;

  const doctorId = req.user._id;

  if (
    !patient ||
    !appointmentDate ||
    !appointmentTime ||
    !reason
  ) {
    res.status(400);
    throw new Error("Please provide all required fields for the appointment.");
  }

  // Find PatientHistory
  let patientHistory = await PatientHistory.findOne({ user: patient });
  if (!patientHistory) {
    // This part of your logic is good!
    patientHistory = new PatientHistory({
      user: patient,
    });
    await patientHistory.save();
  }

  // Find DoctorDetails
  const doctorDetails = await DoctorDetails.findOne({ user: doctorId });
  if (!doctorDetails) {
    res.status(404);
    throw new Error("Logged-in doctor's details not found.");
  }

  const appointment = new Appointment({
    patient,
    patientHistory: patientHistory._id,
    doctor: doctorId, // Use logged-in user ID
    doctorDetails: doctorDetails._id, // Use found doctor details ID
    hospital: doctorDetails.hospital,
    appointmentDate,
    appointmentTime,
    reason,
    status: "confirmed", // Since doctor is booking, let's auto-confirm
  });

  const createdAppointment = await appointment.save();

  // --- THIS IS THE NEW LINE YOU REQUESTED ---
  // Add the new appointment's ID to the PatientHistory.appointments array
  await PatientHistory.findByIdAndUpdate(patientHistory._id, {
    $push: { appointments: createdAppointment._id },
  });
  // ------------------------------------------

  res.status(201).json(createdAppointment);
});


export const getAppointments = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  let query = {};

  // CHANGED: Role-based data filtering for security
  const { role, _id } = req.user; // Get user from authMiddleware

  if (role === "patient") {
    query.patient = _id;
  } else if (role === "doctor") {
    query.doctor = _id;
  } else if (role === "hospitaladmin") {
    // Assuming hospital admin has a hospital ID associated with their user profile
    // This logic may need adjustment based on your User model
    if (!req.user.hospital) {
      res.status(403);
      throw new Error("Hospital admin is not associated with any hospital.");
    }
    query.hospital = req.user.hospital;
  }
  // Admin can see all appointments (no filter)

  const appointments = await Appointment.find(query)
    .populate("patient", "name email")
    .populate("doctor", "name email")
    .populate("hospital", "name")
    .sort({ appointmentDate: -1 }); // Sort by most recent

  res.json(appointments);
});


export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone")
    .populate({
      path: "doctorDetails",
      select: "specialty qualifications",
    })
    .populate("hospital", "name")
    .populate("patientHistory");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // NEW: Security check to ensure users can only access their own appointments
  const { role, _id } = req.user;
  if (
    role !== "admin" &&
    appointment.patient._id.toString() !== _id.toString() &&
    appointment.doctor._id.toString() !== _id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this appointment");
  }

  res.json(appointment);
});


export const updateAppointment = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // You can add more authorization logic here if needed

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.json(updatedAppointment);
});


export const deleteAppointment = asyncHandler(async (req, res) => {
  if (req.user.role === "patient" || req.user.role === "doctor") {
    return res.status(403).json({ message: "Access denied" });
  }
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  await appointment.deleteOne(); // Use deleteOne() for Mongoose v6+
  res.json({ message: "Appointment removed successfully" });
});

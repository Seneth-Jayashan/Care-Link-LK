import Appointment from '../models/Appointment.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import User from '../models/user.js';
import { NotFoundError, ForbiddenError } from '../utils/errorResponse.js';


const getOrCreatePatientHistory = async (patientId) => {
  let patientHistory = await PatientHistory.findOne({ user: patientId });
  if (!patientHistory) {
    patientHistory = new PatientHistory({
      user: patientId,
    });
    await patientHistory.save();
  }
  return patientHistory;
};


export const createAppointmentService = async (data, creatingUser) => {
  const { role } = creatingUser;
  let { patient, doctor, hospital, appointmentDate, appointmentTime, reason } = data;

  if (role === 'doctor') {
    doctor = creatingUser._id; 
    const doctorDetails = await DoctorDetails.findOne({ user: creatingUser._id });
    if (!doctorDetails) {
      throw new Error("Doctor details not found for logged-in user.");
    }
    hospital = doctorDetails.hospital; // Auto-assign doctor's hospital
  }

  const patientHistory = await getOrCreatePatientHistory(patient);

  const doctorUser = await User.findById(doctor);
  if (!doctorUser || !doctorUser.doctorDetails) {
    throw new Error("Doctor details not found for the specified doctor.");
  }

  const appointment = new Appointment({
    patient,
    patientHistory: patientHistory._id,
    doctor: doctorUser._id,
    doctorDetails: doctorUser.doctorDetails,
    hospital,
    appointmentDate,
    appointmentTime,
    reason,
    status: (role === 'doctor' || role === 'hospitaladmin') ? 'confirmed' : 'pending',
  });

  const createdAppointment = await appointment.save();

  await PatientHistory.findByIdAndUpdate(patientHistory._id, {
    $push: { appointments: createdAppointment._id },
  });

  return createdAppointment;
};


export const getAppointmentsService = async (user) => {
  const { role, _id, hospital } = user;
  let query = {};

  if (role === 'patient') {
    query.patient = _id;
  } else if (role === 'doctor') {
    query.doctor = _id;
  } else if (role === 'hospitaladmin') {
    if (!hospital) {
      throw new Error("Hospital admin is not associated with any hospital.");
    }
    query.hospital = hospital;
  }

  return Appointment.find(query)
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('hospital', 'name')
    .sort({ appointmentDate: -1 });
};


export const getAppointmentByIdService = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email phone')
    .populate({ path: 'doctorDetails', select: 'specialty qualifications' })
    .populate('hospital', 'name')
    .populate('patientHistory');

  if (!appointment) {
    throw new NotFoundError('Appointment not found');  
  }

  const { role, _id, hospital } = user;
  const isPatient = appointment.patient._id.toString() === _id.toString();
  const isDoctor = appointment.doctor._id.toString() === _id.toString();
  const isHospitalAdmin = hospital ? appointment.hospital._id.toString() === hospital.toString() : false;


  if (role !== 'admin' && !isPatient && !isDoctor && !isHospitalAdmin) {
    throw new ForbiddenError('Not authorized to view this appointment');
  }

  return appointment;
};


export const updateAppointmentService = async (appointmentId, data, user) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  const { role, _id } = user;
  const isPatient = appointment.patient._id.toString() === _id.toString();
  const isDoctor = appointment.doctor._id.toString() === _id.toString();

  if (role === 'patient' && !isPatient) {
    throw new ForbiddenError('Not authorized to update this appointment');
  }
  if (role === 'doctor' && !isDoctor) {
    throw new ForbiddenError('Not authorized to update this appointment');
  }

  return Appointment.findByIdAndUpdate(appointmentId, data, {
    new: true,
    runValidators: true,
  });
};


export const deleteAppointmentService = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  await appointment.deleteOne();
  return { message: 'Appointment removed successfully' };
};
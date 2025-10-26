import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import { generatePatientQR } from '../utils/qrGenerator.js';
import { sendEmailWithQR } from '../utils/sendEmail.js';

const parseArray = (field) => {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return field;
};

const createPatient = async (user, body) => {
  const {
    dateOfBirth, gender, bloodGroup, address, emergencyContact,
    chronicDiseases, pastSurgeries, familyHistory, allergies, medications, notes, password
  } = body;

  const history = new PatientHistory({
    user: user._id,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    chronicDiseases: parseArray(chronicDiseases),
    pastSurgeries: parseArray(pastSurgeries),
    familyHistory: parseArray(familyHistory),
    allergies: parseArray(allergies),
    currentMedications: parseArray(medications),
    notes: notes || '',
    createdAt: new Date(),
  });

  await history.save();
  user.patientHistory = history._id;
  await user.save();

  // Generate QR and send email
  const qrCodeDataUrl = await generatePatientQR({
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    patientHistoryId: history._id,
  });

  await sendEmailWithQR(user.email, 'Your Patient Account QR', qrCodeDataUrl, password);
  
  // Return the user populated with their new history
  return user;
};

const createDoctor = async (user, body, file) => {
  const {
    specialty, qualifications, yearsOfExperience, consultationFee,
    schedule, languages, bio, notes
  } = body;

  const doctorDetails = new DoctorDetails({
    user: user._id,
    specialty,
    qualifications,
    yearsOfExperience,
    consultationFee,
    schedule: schedule ? JSON.parse(schedule) : [],
    languages,
    bio,
    notes: notes || '',
    profileImage: file ? file.path : null,
    hospital: user.hospital, 
  });

  await doctorDetails.save();
  user.doctorDetails = doctorDetails._id;
  await user.save();
  
  return user;
};

export const createUserService = async (body, file, creatingUser) => {
  const { name, email, password, phone, role } = body;

  const hospital = (role === 'doctor' || role === 'patient') ? creatingUser?.hospital : null;
  
  const user = new User({ 
    name, 
    email, 
    password, 
    phone, 
    role, 
    hospital 
  });

  if (file) user.profileImage = file.path;

  if (role === 'patient') {
    const patientUser = await createPatient(user, body);
    return { 
        message: '✅ Patient created and email sent successfully!', 
        user: patientUser 
    };
  }

  if (role === 'doctor') {
    const doctorUser = await createDoctor(user, body, file);
     return { 
        message: '✅ Doctor created successfully', 
        user: doctorUser 
    };
  }

  await user.save();
  return { 
    message: `✅ ${role} created successfully`, 
    user 
  };
};
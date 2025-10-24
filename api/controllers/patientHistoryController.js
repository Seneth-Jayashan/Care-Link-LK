import mongoose from 'mongoose';
import PatientHistory from '../models/PatientHistory.js';
import User from '../models/user.js';

// Get all patient histories
export const getAllPatientHistories = async (req, res) => {
  // This logic is correct
  if (!req.user || req.user.role === 'patient') {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const histories = await PatientHistory.find().populate('user').populate('appointments');
    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single patient history by ID
export const getPatientHistoryById = async (req, res) => {
  try {
    // 1. Find the history document first
    const history = await PatientHistory.findById(req.params.id)
      .populate('user')
      .populate('appointments');
    
    if (!history) {
      return res.status(404).json({ message: 'Patient history not found' });
    }

    // 2. Now, perform the correct security check
    const { role, _id } = req.user;
    if (role === 'patient' && history.user._id.toString() !== _id.toString()) {
       return res.status(403).json({
         message: 'Access denied: You can only view your own history.',
       });
    }

    // 3. If check passes, send the history
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

// Update patient history
export const updatePatientHistory = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const historyId = req.params.id;

    // 1. Find the history document first
    const history = await PatientHistory.findById(historyId);

    if (!history) {
      return res.status(404).json({ message: 'Patient history not found' });
    }

    // 2. Perform the correct security check
    // Deny if patient is trying to edit someone else's history
    if (role === 'patient' && history.user.toString() !== _id.toString()) {
      return res.status(403).json({
        message: 'Access denied: You can only update your own history.',
      });
    }
    // Deny if a doctor is using this route (they must use the /doctor route)
    if (role === 'doctor') {
       return res.status(403).json({ message: "Access denied. Doctors must use the /doctor/:id route." });
    }

    // 3. If check passes (admin, hospitaladmin, or self-patient), proceed
    const updatedHistory = await PatientHistory.findByIdAndUpdate(
      historyId,
      req.body,
      { new: true, runValidators: true } // Added runValidators
    );
    
    res.json(updatedHistory);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete patient history
export const deletePatientHistory = async (req, res) => {
  // This logic is correct
  if (req.user.role === 'doctor' || req.user.role === 'patient') {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const history = await PatientHistory.findByIdAndDelete(req.params.id);
    if (!history) return res.status(404).json({ message: 'Patient history not found' });
    res.json({ message: 'Patient history deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPatientByQRCode = async (req, res) => {
  // This logic is correct based on your router (authorize('doctor'))
  // if (req.user.role !== 'doctor') { // This is a cleaner check
  if (!req.user || req.user.role === 'admin' || req.user.role === 'patient') {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { patientHistoryId } = req.body;
    if (!patientHistoryId){
      return res.status(400).json({ message: "patientHistoryId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(patientHistoryId)) {
      return res.status(400).json({ message: "Invalid patientHistoryId" });
    }

    const patientHistory = await PatientHistory.findById(patientHistoryId)
      .populate('user', 'name email phone')
      .populate('appointments');

    if (!patientHistory)
      return res.status(404).json({ message: 'Patient not found' });

    res.json(patientHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updatePatientHistoryByDoctor = async (req, res) => {
  // This logic is correct
  if (req.user.role === 'patient') {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { id } = req.params; // patientHistoryId
    const updates = req.body; // e.g., allergies, medications, notes

    const patientHistory = await PatientHistory.findByIdAndUpdate(id, updates, { new: true });
    if (!patientHistory) return res.status(404).json({ message: 'Patient not found' });

    res.json(patientHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getPatientByEmail = async (req,res) => {
  // This logic is correct
  if (!req.user || req.user.role === 'patient') {
    return res.status(403).json({ message: "Access denied" });
  }
  try{
    const { email } =req.params;
    const user = await User.findOne({email});

    if(!user){
      // --- FIX: Corrected .josn to .json ---
      return res.status(404).json({ message: 'Patient not found'});
    }
    
    // Check if user has a patientHistory linked
    if (!user.patientHistory) {
      return res.status(404).json({ message: 'Patient has no history record' });
    }

    const userHistory = await getHistory(user.patientHistory);
    if(!userHistory){
      return res.status(404).json({ message: 'Patient History not found'})
    }

    res.status(200).json({ message: 'Patient History Get Successfully',userHistory })
  }catch(error){
    res.status(500).json({ message: 'Server Error'})
  }
}

export const getHistory = async (historyId) => {
  if (!mongoose.Types.ObjectId.isValid(historyId)) return null;

  const history = await PatientHistory.findById(historyId)
    .populate("user", "name email phone")
    .populate("appointments");

  if(!history){
    return null;
  }
  return history;
};
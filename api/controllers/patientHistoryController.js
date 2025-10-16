import mongoose from 'mongoose';
import PatientHistory from '../models/PatientHistory.js';
import User from '../models/User.js';

// Get all patient histories
export const getAllPatientHistories = async (req, res) => {
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
    const history = await PatientHistory.findOne(req.params.id)
      .populate('user')
      .populate('appointments');
    if (!history) return res.status(404).json({ message: 'Patient history not found' });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update patient history
export const updatePatientHistory = async (req, res) => {
  try {
    const history = await PatientHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!history) return res.status(404).json({ message: 'Patient history not found' });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete patient history
export const deletePatientHistory = async (req, res) => {
  try {
    const history = await PatientHistory.findByIdAndDelete(req.params.id);
    if (!history) return res.status(404).json({ message: 'Patient history not found' });
    res.json({ message: 'Patient history deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPatientByQRCode = async (req, res) => {
  try {
    const { patientHistoryId } = req.body;
    if (!patientHistoryId){
      console.log('error 1');
      return res.status(400).json({ message: "patientHistoryId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(patientHistoryId)) {
            console.log('error 2' , patientHistoryId);

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
  try{
    const { email } =req.params;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).josn({ message: 'Patient not found'});
    }
    const userHistory = await  getPatientHistoryById(user.patientHistory);
    res.status(200).json({ message: 'Patient History Get Successfully',userHistory })
  }catch(error){
    return res.status(500).json({ message: 'Server Error'})
  }
}
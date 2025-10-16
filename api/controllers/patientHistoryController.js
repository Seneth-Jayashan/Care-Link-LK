import PatientHistory from '../models/PatientHistory.js';

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
    const history = await PatientHistory.findById(req.params.id)
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

// GET /api/patients/scan/:id
export const getPatientByQRCode = async (req, res) => {
  try {
    const { patientHistoryId } = req.params;

    const patientHistory = await PatientHistory.findById(patientHistoryId)
      .populate('user', 'name email phone')
      .populate('appointments');

    if (!patientHistory) return res.status(404).json({ message: 'Patient not found' });

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

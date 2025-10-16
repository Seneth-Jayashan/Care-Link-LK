import Hospital from '../models/Hospital.js';
import fs from 'fs';

// Create Hospital
export const createHospital = async (req, res) => {
  try {
    const { name, code, address, contact, departments, bedCapacity, facilities, rating, notes } = req.body;

    const hospital = new Hospital({
      name,
      code,
      address,
      contact,
      departments,
      bedCapacity,
      facilities,
      rating,
      notes,
    });

    await hospital.save();
    res.status(201).json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all hospitals
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('doctors', 'name email role')
      .populate('hospitalAdmins', 'name email role');
    res.json(hospitals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get hospital by ID
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('doctors', 'name email role')
      .populate('hospitalAdmins', 'name email role');
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      hospital[key] = updates[key];
    });

    await hospital.save();
    res.json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

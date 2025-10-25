import Hospital from '../models/Hospital.js';
import fs from 'fs';
import User from '../models/user.js';
import Tesseract from "tesseract.js";
import stringSimilarity from "string-similarity"; 

export const verifyLicense = async (req, res) => {
  const { licensePath, hospitalName } = req.body; 

  if (!licensePath || !hospitalName) {
    return res.status(400).json({
      message: "License path and Hospital Name are required for verification.",
    });
  }

  console.log(`[Verify] Received request for: ${licensePath}`);

  try {
    console.log(`[Verify] Running OCR on ${licensePath} to find name...`);
    const { data: { text } } = await Tesseract.recognize(licensePath, "eng");

    const nameRegex = /Name\s*:\s*(.+)/i;
    const nameMatch = text.match(nameRegex);

    if (!nameMatch || !nameMatch[1]) {
      console.log(`[Verify] FAILED. Could not extract name from document.`);
      return res
        .status(400)
        .json({ message: "Could not read Hospital Name from license document." });
    }

    const extractedName = nameMatch[1].trim();
    console.log(`[Verify] Found name in doc: "${extractedName}"`);
    console.log(`[Verify] Comparing to form name: "${hospitalName}"`);

    const similarity = stringSimilarity.compareTwoStrings(
      extractedName.toLowerCase(),
      hospitalName.toLowerCase()
    );

    if (similarity < 0.6) {
      console.log(`[Verify] FAILED. Name similarity too low: ${similarity}`);
      return res.status(400).json({
        message: `Name mismatch. The name on the license ("${extractedName}") does not closely match the name you entered ("${hospitalName}").`,
      });
    }

    console.log(`[Verify] Name check passed. Similarity: ${similarity}`);

    console.log(`[Verify] Simulating external license check...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`[Verify] SIMULATED SUCCESS for: ${licensePath}`);
    res.status(200).json({
      verified: true,
      message: "License successfully verified (Simulated).",
    });
  } catch (error) {
    console.error("License verification error:", error);
    res
      .status(500)
      .json({ message: "Server error during license verification." });
  }
};

export const createHospital = async (req, res) => {
  if(req.user.role === 'doctor' || req.user.role === 'patient'){
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { name, code, address, contact, departments, bedCapacity, facilities, rating, notes, licenseDocument } = req.body; // 👈 NEW

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
      hospitalAdmins: req.user._id, 
      licenseDocument: licenseDocument
    }); 

    await hospital.save();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hospital: hospital._id }, 
      { new: true } 
    );


    res.status(201).json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get all hospitals
export const getHospitals = async (req, res) => {
  if(req.user.role === 'patient'){
    return res.status(403).json({ message: "Access denied" });
  }
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
  if(req.user.role === 'patient'){
    return res.status(403).json({ message: "Access denied" });
  }
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
  if(req.user.role === 'doctor'){
    return res.status(403).json({ message: "Access denied" });
  }
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
  if(req.user.role === 'doctor'){
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const user = await User.findById(req.user._id); 
    if (user) {
      user.hospital = null;
      await user.save();  // save changes
    }
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

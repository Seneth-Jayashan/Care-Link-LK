import Tesseract from 'tesseract.js';
import stringSimilarity from 'string-similarity';
import Hospital from '../models/Hospital.js';
import User from '../models/user.js';
import { BadRequestError, NotFoundError } from '../utils/errorResponse.js';


export const verifyLicenseService = async (licensePath, hospitalName) => {
  if (!licensePath || !hospitalName) {
    throw new BadRequestError("License path and Hospital Name are required.");
  }

  try {
    console.log(`[Verify] Running OCR on ${licensePath}...`);
    const { data: { text } } = await Tesseract.recognize(licensePath, "eng");


    const nameRegex = /Name\s*:\s*(.+)/i;
    const nameMatch = text.match(nameRegex);

    if (!nameMatch || !nameMatch[1]) {
      console.log(`[Verify] FAILED. Could not extract name from document.`);
      throw new BadRequestError("Could not read Hospital Name from license document.");
    }

    const extractedName = nameMatch[1].trim();
    console.log(`[Verify] Found: "${extractedName}", Comparing to: "${hospitalName}"`);

    const similarity = stringSimilarity.compareTwoStrings(
      extractedName.toLowerCase(),
      hospitalName.toLowerCase()
    );

    if (similarity < 0.6) {
      console.log(`[Verify] FAILED. Similarity too low: ${similarity}`);
      throw new BadRequestError(`Name mismatch. The name on the license ("${extractedName}") does not closely match the name you entered ("${hospitalName}").`);
    }

    console.log(`[Verify] Name check passed. Similarity: ${similarity}`);
    
    console.log(`[Verify] Simulating external license check...`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay

    return {
      verified: true,
      message: "License successfully verified (Simulated).",
    };

  } catch (error) {
    console.error("License verification error:", error);
    if (error instanceof BadRequestError) throw error;
    throw new Error(`Server error during license verification: ${error.message}`);
  }
};


export const createHospitalService = async (data, creatingUser) => {
  const { name, code, address, contact, licenseDocument } = data;

  const hospital = new Hospital({
    name,
    code,
    address,
    contact,
    licenseDocument,
    hospitalAdmins: [creatingUser._id], 
  });

  await hospital.save();

  await User.findByIdAndUpdate(
    creatingUser._id,
    { hospital: hospital._id },
    { new: true }
  );

  return hospital;
};


export const getHospitalsService = async () => {
  return Hospital.find()
    .populate('doctors', 'name email role')
    .populate('hospitalAdmins', 'name email role');
};


export const getHospitalByIdService = async (id) => {
  const hospital = await Hospital.findById(id)
    .populate('doctors', 'name email role')
    .populate('hospitalAdmins', 'name email role');
    
  if (!hospital) {
    throw new NotFoundError('Hospital not found');
  }
  return hospital;
};


export const updateHospitalService = async (id, data) => {
  const hospital = await Hospital.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!hospital) {
    throw new NotFoundError('Hospital not found');
  }
  return hospital;
};


export const deleteHospitalService = async (id) => {
  const hospital = await Hospital.findByIdAndDelete(id);

  if (!hospital) {
    throw new NotFoundError('Hospital not found');
  }
  

  return { message: 'Hospital deleted successfully' };
};
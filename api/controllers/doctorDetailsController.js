import DoctorDetails from '../models/DoctorDetails.js';

// Get all doctor details
export const getAllDoctorDetails = async (req, res) => {
  try {
    const doctors = await DoctorDetails.find()
      .populate({
        path: 'user',
        populate: { path: 'hospital' } 
      })
      .populate('hospital'); 

    let result = doctors;

    if (req.user.role !== 'admin') {
      const reqHospitalId = req.user?.hospital?._id?.toString();
      result = doctors.filter(doc => {
        const userHospitalId = doc.user?.hospital?._id?.toString();
        return userHospitalId === reqHospitalId;
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching doctor details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// Get single doctor details by ID
export const getDoctorDetailsById = async (req, res) => {
  try {
    const doctor = await DoctorDetails.findById(req.params.id).populate('user').populate('hospital');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single doctor details by ID
export const getDoctorDetailsByUserId = async (req, res) => {
  try {
    const doctor = await DoctorDetails.findOne({user:req.params.id}).populate('user').populate('hospital');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update doctor details
export const updateDoctorDetails = async (req, res) => {
  try {
    const doctor = await DoctorDetails.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete doctor details
export const deleteDoctorDetails = async (req, res) => {
  try {
    const doctor = await DoctorDetails.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

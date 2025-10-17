import React, { useEffect, useState } from "react";
import DoctorCard from "../patient/DoctorCard";
import DoctorModal from "./DoctorDetailPage";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const DisplayDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors"); // fetch all doctors
      setDoctors(res.data); // make sure backend populates `user` and `hospital`
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Our Doctors</h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onView={() => navigate(`/doctor/${doctor._id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {selectedDoctor && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
};

export default DisplayDoctors;

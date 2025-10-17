import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Building, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api"; // your axios instance

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBookNow = () => {
    navigate(`/book/${doctor._id}`);
  };

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;
  if (!doctor) return <p className="p-6 text-gray-600">Doctor not found.</p>;

  const profileImg =
    doctor.profilePicture ||
    doctor.user?.profileImage ||
    "/default-avatar.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 bg-gray-50 min-h-screen flex justify-center"
    >
      <div className="max-w-xl w-full ">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-blue-600 font-semibold hover:text-blue-800"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Doctor Card */}
        <div className=" flex- items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 flex flex-col md:flex-row items-center gap-8">

          {/* Left: Profile Image */}
          <div className="flex flex-col items-center md:w-1/3">
            <img
              src={`http://localhost:3001/${profileImg.replace(/\\/g, "/")}`}
              alt={doctor.user?.name || "Doctor"}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
          </div>

          {/* Right: Details + Book Now */}
          <div className="flex flex-col justify-center md:w-2/3 gap-4 text-center md:text-left">
            {/* Details */}
            <div className="flex flex-col gap-2 items-center md:items-start">
              <h2 className="text-2xl font-bold text-gray-800">{doctor.user?.name}</h2>
              <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start">
                <Stethoscope size={16} /> {doctor.specialty || "Not specified"}
              </p>
              {doctor.yearsOfExperience !== undefined && (
                <p className="text-gray-500">Experience: {doctor.yearsOfExperience} years</p>
              )}
              {doctor.consultationFee !== undefined && (
                <p className="text-gray-500">Fee: {doctor.consultationFee} LKR</p>
              )}
              {doctor.bio && <p className="text-gray-700">{doctor.bio}</p>}
              {doctor.notes && <p className="text-gray-500">{doctor.notes}</p>}
              {doctor.schedule?.length > 0 && (
                <ul className="list-disc list-inside text-gray-500">
                  {doctor.schedule.map((s, idx) => (
                    <li key={idx}>
                      {s.day}: {s.startTime} - {s.endTime}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Book Now Button */}
            <div className="mt-4 flex justify-center md:justify-start">
              <button
                onClick={handleBookNow}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorDetailPage;

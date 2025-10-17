import React, { useEffect, useState, useMemo } from "react";
import DoctorCard from "./DoctorCard"; // Assuming DoctorCard is in the same folder
// In your DisplayDoctors.jsx file
import DoctorDetailModal from "./DoctorDetailModal.jsx"; // No extension needed
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/api";
import { Search, SlidersHorizontal, XCircle } from "lucide-react";

// Skeleton component for a better loading experience
const DoctorCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 h-full animate-pulse">
    <div className="w-28 h-28 rounded-full bg-gray-200 mb-4"></div>
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
    <div className="h-8 w-1/2 bg-gray-200 rounded-full mb-4"></div>
    <div className="h-5 w-full bg-gray-200 rounded mt-auto"></div>
    <div className="mt-auto pt-4 w-full">
      <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);


const DisplayDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/doctors");
        const validDoctors = res.data.filter(doc => doc.user && typeof doc.user === 'object');
        setDoctors(validDoctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Memoize specialty list to prevent recalculation on every render
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(doctors.map(doc => doc.specialty))];
    return ["All", ...uniqueSpecialties];
  }, [doctors]);

  // Memoize filtered doctors for performance
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = 
        doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = 
        selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);


  return (
    <div className="p-6 md:p-10 bg-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800">Find Your Doctor</h1>
            <p className="text-lg text-gray-600 mt-2">Book an appointment with our expert specialists.</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
            <div className="relative flex-grow w-full md:max-w-xs">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
            </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
          </div>
        ) : error ? (
            <div className="text-center py-10 px-4 bg-red-50 rounded-lg">
                <XCircle className="mx-auto text-red-500" size={48} />
                <h3 className="mt-4 text-xl font-semibold text-red-800">An Error Occurred</h3>
                <p className="text-red-600 mt-2">{error}</p>
            </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onView={() => setSelectedDoctor(doctor)}
                  />
                ))
              ) : (
                <motion.div layout className="col-span-full text-center py-10 px-4">
                     <h3 className="text-xl font-semibold text-gray-700">No Doctors Found</h3>
                     <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <DoctorDetailModal
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisplayDoctors;
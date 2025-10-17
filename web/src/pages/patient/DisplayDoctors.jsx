import React, { useEffect, useState, useMemo } from "react";
import DoctorCard from "./DoctorCard";
import DoctorDetailModal from "./DoctorDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/api";
import { Search, Filter, X, Users, Award, Clock, Stethoscope } from "lucide-react";

const DoctorCardSkeleton = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-lg animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-20 h-20 bg-blue-200 rounded-2xl"></div>
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-blue-200 rounded w-3/4"></div>
        <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        <div className="h-4 bg-blue-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default function DisplayDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/doctors");
        const validDoctors = res.data.filter((doc) => doc.user && typeof doc.user === "object");
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

  const specialties = useMemo(() => {
    const unique = [...new Set(doctors.map((doc) => doc.specialty))];
    return ["All", ...unique];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const search =
        d.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const match = selectedSpecialty === "All" || d.specialty === selectedSpecialty;
      return search && match;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 transition-all duration-500">

      {/* 🌟 HERO SECTION with compact filter/search slot */}
      <div className="bg-blue-100/60 border-b border-blue-200 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-2"
          >
            Find Your Doctor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-600 text-base md:text-lg mb-6"
          >
            Search, filter, and connect with trusted medical professionals
          </motion.p>

          {/* 🔍 Compact Search + Filter Bar */}
          <div className="bg-white/80 backdrop-blur-md border border-blue-200 rounded-full shadow-sm flex flex-col sm:flex-row items-stretch overflow-hidden max-w-3xl mx-auto">
            <div className="flex items-center flex-grow px-4">
              <Search className="h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-3 py-3 bg-transparent outline-none text-blue-800 placeholder-blue-400"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* Specialty Dropdown (short slot style) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <div className="flex flex-wrap justify-center gap-3 px-4">
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => {
                        setSelectedSpecialty(spec);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                        selectedSpecialty === spec
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Row (mini) */}
          <div className="flex justify-center gap-6 mt-8 flex-wrap">
            {[
              { icon: <Users className="h-4 w-4 text-blue-600" />, value: `${doctors.length}+`, label: "Doctors" },
              { icon: <Award className="h-4 w-4 text-blue-600" />, value: specialties.length - 1, label: "Specialties" },
              { icon: <Clock className="h-4 w-4 text-blue-600" />, value: "24/7", label: "Service" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center space-x-2 bg-white border border-blue-100 rounded-xl px-4 py-2 shadow-sm"
              >
                {item.icon}
                <span className="text-blue-800 font-semibold">{item.value}</span>
                <span className="text-blue-500 text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧑‍⚕️ DOCTORS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200 shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-3">Connection Issue</h3>
            <p className="text-blue-600 text-lg mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold"
            >
              Refresh Page
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <DoctorCard doctor={doctor} onView={() => setSelectedDoctor(doctor)} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-blue-200">
                  <Search className="mx-auto h-10 w-10 text-blue-400 mb-4" />
                  <h3 className="text-2xl font-semibold text-blue-900">No Specialists Found</h3>
                  <p className="text-blue-600 mt-2 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialty("All");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
                  >
                    Show All
                  </button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* MODAL */}
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
}

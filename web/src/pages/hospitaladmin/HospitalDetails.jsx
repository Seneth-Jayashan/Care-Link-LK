import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Users,
  Star,
  FileText,
  Plus,
  Trash2,
  List,
} from "lucide-react";

// The full component now handles both the tabs and the form logic
export default function HospitalManager() {
  // State for tab selection: 'view' or 'add'
  const [activeTab, setActiveTab] = useState("add");

  // State for the Add Hospital Form
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: {
      street: "",
      city: "",
      district: "",
      province: "",
      postalCode: "",
      country: "Sri Lanka",
    },
    contact: {
      phone: "",
      email: "",
    },
    departments: [{ name: "", description: "" }],
    bedCapacity: "",
    facilities: [""],
    rating: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper component for Section Headers
  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="text-blue-600" size={20} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  // --- Form Handlers ---
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: {
        street: "",
        city: "",
        district: "",
        province: "",
        postalCode: "",
        country: "Sri Lanka",
      },
      contact: {
        phone: "",
        email: "",
      },
      departments: [{ name: "", description: "" }],
      bedCapacity: "",
      facilities: [""],
      rating: "",
      notes: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDepartmentChange = (index, field, value) => {
    const updated = [...formData.departments];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const addDepartment = () => {
    setFormData((prev) => ({
      ...prev,
      departments: [...prev.departments, { name: "", description: "" }],
    }));
  };

  const removeDepartment = (index) => {
    if (formData.departments.length > 1) {
      const updated = formData.departments.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, departments: updated }));
    }
  };

  const handleFacilityChange = (index, value) => {
    const updated = [...formData.facilities];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, facilities: updated }));
  };

  const addFacility = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [...prev.facilities, ""],
    }));
  };

  const removeFacility = (index) => {
    if (formData.facilities.length > 1) {
      const updated = formData.facilities.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, facilities: updated }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      // const res = await axios.post("/api/hospitals", formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      setMessage("✅ Hospital added successfully!");
      resetForm();
    } catch (err) {
      setMessage(
        "❌ Error adding hospital: " +
          err.response?.data?.message || "Check console for details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- View Hospitals Component (Placeholder) ---
  const ViewHospitals = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-8 h-[60vh] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"
    >
      <div className="text-center text-gray-500">
        <List className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold">Hospital List</h2>
        <p className="mt-2 text-lg">
          This is where you would display the list or table of all hospitals.
        </p>
        <p className="text-sm mt-1 text-gray-400">
          (Replace this placeholder component with your actual data fetching and table.)
        </p>
      </div>
    </motion.div>
  );

  // --- Add Hospital Form Component (The original logic) ---
  const AddHospitalForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.includes("Error")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div>
          <SectionHeader
            icon={Building}
            title="Basic Information"
            subtitle="Enter hospital identification details"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter unique code"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <SectionHeader
            icon={MapPin}
            title="Address Information"
            subtitle="Complete hospital location details"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "street",
              "city",
              "district",
              "province",
              "postalCode",
              "country",
            ].map((field) => (
              <div
                key={field}
                className={field === "street" ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={`address.${field}`}
                  value={formData.address[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <SectionHeader
            icon={Phone}
            title="Contact Information"
            subtitle="Primary contact details"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div>
          <SectionHeader
            icon={Users}
            title="Departments"
            subtitle="Add hospital departments and descriptions"
          />
          <div className="space-y-4">
            {formData.departments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Department Name"
                    value={dept.name}
                    onChange={(e) =>
                      handleDepartmentChange(index, "name", e.target.value)
                    }
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={dept.description}
                    onChange={(e) =>
                      handleDepartmentChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                {formData.departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDepartment(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            ))}
            <motion.button
              type="button"
              onClick={addDepartment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              <Plus size={18} />
              Add Department
            </motion.button>
          </div>
        </div>

        {/* Facilities */}
        <div>
          <SectionHeader
            icon={Building}
            title="Facilities"
            subtitle="List available hospital facilities"
          />
          <div className="space-y-4">
            {formData.facilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-center"
              >
                <input
                  type="text"
                  placeholder="e.g., ICU, Radiology, Emergency Room"
                  value={facility}
                  onChange={(e) => handleFacilityChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                {formData.facilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            ))}
            <motion.button
              type="button"
              onClick={addFacility}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              <Plus size={18} />
              Add Facility
            </motion.button>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <SectionHeader
            icon={FileText}
            title="Additional Information"
            subtitle="Capacity, ratings, and notes"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bed Capacity
              </label>
              <input
                type="number"
                name="bedCapacity"
                value={formData.bedCapacity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter total beds"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <div className="relative">
                <Star
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400"
                  size={18}
                />
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="0.0 - 5.0"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Enter any additional information or notes..."
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding Hospital...
              </>
            ) : (
              <>
                <Building size={20} />
                Add Hospital
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  // --- Main Render Function for HospitalManager ---
  const tabs = [
    { id: "view", label: "View Hospitals", icon: List },
    { id: "add", label: "Add Hospital", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto" // Increased max-width for better layout with tabs
      >
        {/* --- TOPIC: HOSPITAL --- */}
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          <Building className="inline-block mr-3 text-blue-600" size={32} />
          Hospital
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header & Sliding Menu */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-2">
            <div className="flex justify-start relative border-b border-white/20">
              {tabs.map((tab) => {
                // Calculate properties for the sliding indicator
                let tabWidth = tab.id === 'view' ? 180 : 150; // Approximated width
                let tabX = tab.id === 'view' ? 0 : 180; // Starting position for the second tab

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-lg font-bold transition-colors duration-300 relative z-10 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-blue-200 hover:text-white/80"
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </motion.button>
                );
              })}

              {/* Sliding Indicator */}
              <motion.div
                className="absolute bottom-0 h-1 bg-white rounded-full"
                initial={false}
                animate={{
                  width: activeTab === "view" ? "180px" : "150px",
                  x: activeTab === "view" ? 0 : 180,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-0">
            {activeTab === "add" ? <AddHospitalForm /> : <ViewHospitals />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
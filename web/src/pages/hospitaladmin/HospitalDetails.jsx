import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Building,
  MapPin,
  Phone,
  Mail,
  Users,
  Star,
  FileText,
  List,
  Loader2,
  Edit2,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import api from "../../api/api"; // ✅ centralized axios instance

// ------------------- Reusable Components -------------------

// Section Header Component
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

// Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  message,
  confirmText = "Delete",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-4"
      >
        <div className="flex justify-between items-start">
          <AlertTriangle className="text-red-500 mr-3 mt-1" size={24} />
          <h4 className="text-xl font-bold text-gray-900 flex-1">
            Confirm Deletion
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-700">
          {message ||
            `Are you sure you want to delete ${item}'s record? This action cannot be undone.`}
        </p>
        
        <div className="flex justify-end gap-3 pt-2">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
          >
            <Trash2 size={16} />
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// ------------------- Main Component -------------------

export default function HospitalManagement() {
  const [activeTab, setActiveTab] = useState("view"); // "view" | "add" | "edit"
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State for Deleting
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteHospital, setDeleteHospital] = useState(null);

  // Initial Form State
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------- 🧹 UTILS -------------------

  const resetFormData = () => setFormData(initialFormData);

  // ------------------- 🏥 API CALLS -------------------

  // GET HOSPITALS
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hospitals");
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") fetchHospitals();
  }, [activeTab]);

  // DELETE HOSPITAL
  const handleDeleteConfirm = (hospital) => {
    setDeleteHospital(hospital);
    setIsDeleting(true);
  };

  const deleteHospitalApi = async () => {
    if (!deleteHospital) return;

    setIsSubmitting(true);
    setIsDeleting(false); // Close modal right away
    setMessage("");

    try {
      await api.delete(`/hospitals/${deleteHospital._id}`);
      setMessage(`✅ Hospital "${deleteHospital.name}" deleted successfully!`);
      fetchHospitals(); // refresh view
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Something went wrong";
      setMessage(`❌ Error deleting hospital: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
      setDeleteHospital(null);
    }
  };

  // EDIT HOSPITAL (Setup)
  const startEdit = (hospital) => {
    // Populate form data with the hospital details
    setFormData({
      name: hospital.name || "",
      code: hospital.code || "",
      address: hospital.address || initialFormData.address,
      contact: hospital.contact || initialFormData.contact,
      // Ensure departments and facilities are arrays, not null/undefined
      departments: hospital.departments?.length > 0 ? hospital.departments : initialFormData.departments,
      facilities: hospital.facilities?.length > 0 ? hospital.facilities : initialFormData.facilities,
      bedCapacity: hospital.bedCapacity || "",
      rating: hospital.rating || "",
      notes: hospital.notes || "",
    });
    setEditingId(hospital._id);
    setActiveTab("add"); // Use the 'add' tab for the form, renaming its purpose temporarily
    setIsEditing(true);
  };

  // ------------------- 📝 FORM HANDLERS -------------------

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

  // Departments
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

  // Facilities
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

  // ------------------- 🚀 SUBMIT FORM -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      if (isEditing) {
        // EDIT submission
        await api.put(`/hospitals/${editingId}`, formData);
        setMessage("✅ Hospital updated successfully!");
        setIsEditing(false);
        setEditingId(null);
      } else {
        // ADD submission
        await api.post("/hospitals", formData);
        setMessage("✅ Hospital added successfully!");
      }

      fetchHospitals(); // refresh view
      resetFormData();
      setActiveTab("view"); // Switch back to view after successful operation

    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Something went wrong";
      setMessage(`❌ Error ${isEditing ? 'updating' : 'adding'} hospital: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- MAIN UI -------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hospital Management</h1>
              <p className="text-blue-100">Manage and register hospitals</p>
            </div>
          </div>

          {/* Sliding Menu */}
          <div className="flex bg-white/20 rounded-xl backdrop-blur-md overflow-hidden">
            {[
              { id: "view", label: "View Details", icon: List },
              { id: "add", label: isEditing ? "Edit Hospital" : "Add Hospital", icon: isEditing ? Edit2 : Plus },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'add' && !isEditing) resetFormData(); // Only reset on fresh "Add" click
                  if (tab.id === 'view') setIsEditing(false); // Stop editing mode when switching to view
                }}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Messages */}
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

          {/* ------------------- VIEW TAB ------------------- */}
          <AnimatePresence mode="wait">
            {activeTab === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
              >
                <SectionHeader
                  icon={List}
                  title="Registered Hospitals"
                  subtitle="All hospitals currently in the system"
                />

                {loading ? (
                  <div className="flex justify-center items-center py-20 text-blue-600">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Loading hospitals...
                  </div>
                ) : hospitals.length === 0 ? (
                  <p className="text-gray-600 text-center py-12">
                    No hospitals found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-blue-50 text-blue-700">
                        <tr>
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-left">Code</th>
                          <th className="py-3 px-4 text-left">City</th>
                          <th className="py-3 px-4 text-left">Phone</th>
                          <th className="py-3 px-4 text-left">Beds</th>
                          <th className="py-3 px-4 text-left">Rating</th>
                          <th className="py-3 px-4 text-center">Actions</th> {/* New Column */}
                        </tr>
                      </thead>
                      <tbody>
                        {hospitals.map((h) => (
                          <tr
                            key={h._id}
                            className="border-t hover:bg-gray-50 transition"
                          >
                            <td className="py-3 px-4 font-medium">{h.name}</td>
                            <td className="py-3 px-4">{h.code}</td>
                            <td className="py-3 px-4">{h.address?.city}</td>
                            <td className="py-3 px-4">{h.contact?.phone}</td>
                            <td className="py-3 px-4">{h.bedCapacity}</td>
                            <td className="py-3 px-4">{h.rating}</td>
                            <td className="py-3 px-4 flex justify-center gap-2"> {/* Action Buttons */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startEdit(h)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                                title="Edit Hospital"
                              >
                                <Edit2 size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteConfirm(h)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                                title="Delete Hospital"
                                disabled={isSubmitting} // Disable during any submission
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ------------------- ADD/EDIT TAB ------------------- */}
            {activeTab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: isEditing ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isEditing ? 30 : -30 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <SectionHeader
                    icon={isEditing ? Edit2 : Plus}
                    title={isEditing ? `Editing: ${formData.name}` : "Add New Hospital"}
                    subtitle={isEditing ? "Modify hospital details" : "Enter details for a new hospital registration"}
                  />
                  
                  {/* Basic Info */}
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

                  {/* Address */}
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
                            placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
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
                      <AnimatePresence>
                        {formData.departments.map((dept, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-4 items-start overflow-hidden"
                          >
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Department Name"
                                value={dept.name}
                                onChange={(e) =>
                                  handleDepartmentChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
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
                              <motion.button
                                type="button"
                                onClick={() => removeDepartment(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition mt-0.5"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
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
                      <AnimatePresence>
                        {formData.facilities.map((facility, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-4 items-center overflow-hidden"
                          >
                            <input
                              type="text"
                              placeholder="e.g., ICU, Radiology, Emergency Room"
                              value={facility}
                              onChange={(e) =>
                                handleFacilityChange(index, e.target.value)
                              }
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            {formData.facilities.length > 1 && (
                              <motion.button
                                type="button"
                                onClick={() => removeFacility(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
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

                  {/* Additional Info */}
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
                          Rating (0–5)
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
                      />
                    </div>
                  </div>

                  {/* Submit */}
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
                          {isEditing ? 'Updating Hospital...' : 'Adding Hospital...'}
                        </>
                      ) : (
                        <>
                          {isEditing ? <Edit2 size={20} /> : <Building size={20} />}
                          {isEditing ? 'Save Changes' : 'Add Hospital'}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleting && deleteHospital && (
          <ConfirmationDialog
            isOpen={isDeleting}
            onClose={() => setIsDeleting(false)}
            onConfirm={deleteHospitalApi}
            item={deleteHospital.name}
            message={`You are about to permanently delete the hospital record for "${deleteHospital.name}".`}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
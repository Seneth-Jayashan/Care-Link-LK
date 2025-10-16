import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Stethoscope,
  Calendar,
  Shield,
  Briefcase,
  Building,
  DollarSign,
  Languages,
  FileText,
  X,
  Image as ImageIcon,
  Mail,
  Lock,
  Phone,
  User,
} from "lucide-react";
import api from "../../api/api";

// Message banner for feedback
const MessageBanner = ({ type, message }) => {
  if (!message) return null;

  const baseClasses =
    "p-4 mb-6 rounded-xl border-l-4 font-medium flex items-center gap-3";
  let classes = "";
  let icon = null;

  if (type === "success") {
    classes = `${baseClasses} bg-green-100 border-green-600 text-green-800`;
    icon = <Shield size={20} className="text-green-600" />;
  } else if (type === "error") {
    classes = `${baseClasses} bg-red-100 border-red-500 text-red-700`;
    icon = <X size={20} className="text-red-500" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={classes}
    >
      {icon}
      {message}
    </motion.div>
  );
};

// Input field component
const CustomInput = ({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-care-primary focus:border-care-primary focus:outline-none transition ${
          error ? "border-red-400" : "border-gray-300"
        } bg-white`}
        {...(type === "file" ? { accept: "image/*" } : {})}
      />
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const AddDoctorPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "doctor",
    specialty: "",
    qualifications: "",
    yearsOfExperience: "",
    hospital: "",
    consultationFee: "",
    languages: "",
    bio: "",
    profilePicture: null,
    notes: "",
    schedule: [{ day: "", startTime: "", endTime: "" }],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.specialty) newErrors.specialty = "Specialty is required.";
    if (!formData.hospital) newErrors.hospital = "Hospital ID is required.";
    if (!formData.consultationFee)
      newErrors.consultationFee = "Consultation fee is required.";
    if (!formData.languages)
      newErrors.languages = "Languages are required (comma-separated).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      setMessage({ type: "error", text: "Please correct the highlighted fields." });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "You must be logged in as admin to add a doctor." });
      return;
    }

    setIsLoading(true);
    try {
      const formattedData = {
        ...formData,
        qualifications: formData.qualifications
          .split(",")
          .map((q) => q.trim())
          .filter(Boolean),
        languages: formData.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        role: "doctor",
      };

      const data = new FormData();
      if (formData.profilePicture) {
        data.append("profileImage", formData.profilePicture); // matches backend
      }

      Object.keys(formattedData).forEach((key) => {
        if (key !== "profilePicture") {
          if (key === "schedule") {
            data.append(key, JSON.stringify(formattedData[key]));
          } else {
            data.append(key, formattedData[key]);
          }
        }
      });

      await api.post("/users", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: "success", text: "Doctor successfully added to CARE-LINK." });

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "doctor",
        specialty: "",
        qualifications: "",
        yearsOfExperience: "",
        hospital: "",
        consultationFee: "",
        languages: "",
        bio: "",
        profilePicture: null,
        notes: "",
        schedule: [{ day: "", startTime: "", endTime: "" }],
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Unauthorized. Make sure you are logged in as admin.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to add doctor. Check server logs.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-care-light min-h-full rounded-2xl shadow-xl border border-care-accent/50"
    >
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-care-primary/10 rounded-full">
          <UserPlus size={28} className="text-care-primary" />
        </div>
        <h1 className="text-3xl font-bold text-care-dark">
          Onboard New Physician
        </h1>
      </div>

      <AnimatePresence>
        <MessageBanner type={message.type} message={message.text} />
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <fieldset className="p-6 border border-care-accent rounded-xl bg-white/70">
          <legend className="px-3 text-lg font-semibold text-care-dark flex items-center gap-2">
            <UserPlus size={20} /> Basic Information
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <CustomInput
              id="name"
              label="Full Name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              placeholder="Dr. John Doe"
              error={errors.name}
            />
            <CustomInput
              id="email"
              label="Email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@example.com"
              error={errors.email}
            />
            <CustomInput
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              error={errors.password}
            />
            <CustomInput
              id="phone"
              label="Phone"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              error={errors.phone}
            />
          </div>
        </fieldset>

        {/* Professional Info */}
        <fieldset className="p-6 border border-care-accent rounded-xl bg-white/70">
          <legend className="px-3 text-lg font-semibold text-care-dark flex items-center gap-2">
            <Stethoscope size={20} /> Professional Details
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <CustomInput
              id="specialty"
              label="Specialty"
              icon={Stethoscope}
              value={formData.specialty}
              onChange={handleChange}
              placeholder="Cardiology"
              error={errors.specialty}
            />
            <CustomInput
              id="qualifications"
              label="Qualifications (comma-separated)"
              icon={Briefcase}
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="MBBS, MD"
              error={errors.qualifications}
            />
            <CustomInput
              id="yearsOfExperience"
              label="Years of Experience"
              type="number"
              icon={Calendar}
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="5"
            />
            <CustomInput
              id="hospital"
              label="Hospital ID"
              icon={Building}
              value={formData.hospital}
              onChange={handleChange}
              placeholder="Hospital ObjectId"
              error={errors.hospital}
            />
            <CustomInput
              id="consultationFee"
              label="Consultation Fee"
              type="number"
              icon={DollarSign}
              value={formData.consultationFee}
              onChange={handleChange}
              placeholder="5000"
              error={errors.consultationFee}
            />
          </div>
        </fieldset>

        {/* Schedule */}
        <fieldset className="p-6 border border-care-accent rounded-xl bg-white/70">
          <legend className="px-3 text-lg font-semibold text-care-dark flex items-center gap-2">
            <Calendar size={20} /> Weekly Schedule
          </legend>
          {formData.schedule.map((s, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 mt-4">
              <select
                className="border p-3 rounded-xl"
                value={s.day}
                onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
              >
                <option value="">Select Day</option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="border p-3 rounded-xl"
                value={s.startTime}
                onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
              />
              <input
                type="time"
                className="border p-3 rounded-xl"
                value={s.endTime}
                onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
              />
            </div>
          ))}
        </fieldset>

        {/* Additional Info */}
        <fieldset className="p-6 border border-care-accent rounded-xl bg-white/70">
          <legend className="px-3 text-lg font-semibold text-care-dark flex items-center gap-2">
            <FileText size={20} /> Additional Information
          </legend>
          <CustomInput
            id="languages"
            label="Languages (comma-separated)"
            icon={Languages}
            value={formData.languages}
            onChange={handleChange}
            placeholder="English, Sinhala"
            error={errors.languages}
          />
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Doctor's biography..."
            className="mt-3 w-full p-3 border rounded-xl focus:ring-2 focus:ring-care-primary"
            rows="4"
          ></textarea>
          <CustomInput
            id="profilePicture"
            label="Profile Picture"
            type="file"
            icon={ImageIcon}
            onChange={handleChange}
          />
          <CustomInput
            id="notes"
            label="Admin Notes"
            icon={FileText}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Internal notes..."
          />
        </fieldset>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Add Doctor to System
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddDoctorPage;

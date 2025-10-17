import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Stethoscope,
  Calendar,
  Briefcase,
  DollarSign,
  Languages,
  FileText,
  Image as ImageIcon,
  X,
  Shield,
} from "lucide-react";
import api from "../../api/api";

const MessageBanner = ({ type, message }) => {
  if (!message) return null;
  const baseClasses = "p-4 mb-6 rounded-xl border-l-4 font-medium flex items-center gap-3";
  let classes = "", icon = null;
  if (type === "success") { classes = `${baseClasses} bg-green-100 border-green-600 text-green-800`; icon = <Shield size={20} className="text-green-600" />; }
  else if (type === "error") { classes = `${baseClasses} bg-red-100 border-red-500 text-red-700`; icon = <X size={20} className="text-red-500" />; }
  return <div className={classes}>{icon}{message}</div>;
};

const CustomInput = ({ id, label, type = "text", icon: Icon, value, onChange, placeholder, error }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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
        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none ${error ? "border-red-400" : "border-gray-300"}`}
        {...(type === "file" ? { accept: "image/*" } : {})}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default function DoctorForm({ onClose, doctor }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialty: "",
    qualifications: "",
    yearsOfExperience: "",
    consultationFee: "",
    schedule: [{ day: "", startTime: "", endTime: "" }],
    languages: "",
    bio: "",
    profilePicture: null,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.user?.name || "",
        email: doctor.user?.email || "",
        password: "",
        phone: doctor.user?.phone || "",
        specialty: doctor.specialty || "",
        qualifications: (doctor.qualifications || []).join(", "),
        yearsOfExperience: doctor.yearsOfExperience || "",
        consultationFee: doctor.consultationFee || "",
        schedule: doctor.schedule.length ? doctor.schedule : [{ day: "", startTime: "", endTime: "" }],
        languages: (doctor.languages || []).join(", "),
        bio: doctor.bio || "",
        profilePicture: null,
        notes: doctor.notes || "",
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData(prev => ({ ...prev, [name]: files[0] }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addScheduleRow = () => setFormData(prev => ({ ...prev, schedule: [...prev.schedule, { day: "", startTime: "", endTime: "" }] }));
  const removeScheduleRow = (index) => setFormData(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      const qualifications = formData.qualifications.split(",").map(q => q.trim()).filter(Boolean);
      const languages = formData.languages.split(",").map(l => l.trim()).filter(Boolean);

      Object.entries({
        ...formData,
        qualifications,
        languages,
        schedule: JSON.stringify(formData.schedule),
        role: "doctor",
      }).forEach(([key, value]) => {
        if (key === "profilePicture" && value) data.append("profilePicture", value);
        else data.append(key, value);
      });

      if (doctor) {
        // Update existing doctor
        await api.put(`/users/${doctor.user._id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        setMessage({ type: "success", text: "Doctor updated successfully." });
      } else {
        // Add new doctor
        await api.post("/users", data, { headers: { Authorization: `Bearer ${token}` } });
        setMessage({ type: "success", text: "Doctor added successfully." });
      }

      onClose(true); // notify parent to refresh
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save doctor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-h-[90vh] overflow-auto">
      <h2 className="text-2xl font-bold mb-4">{doctor ? "Edit Doctor" : "Add New Doctor"}</h2>
      <MessageBanner type={message.type} message={message.text} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="p-4 border rounded-xl">
          <legend className="font-semibold">Basic Info</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <CustomInput id="name" label="Full Name" icon={User} value={formData.name} onChange={handleChange} />
            <CustomInput id="email" label="Email" icon={Mail} value={formData.email} onChange={handleChange} />
            <CustomInput id="password" label="Password" type="password" icon={Lock} value={formData.password} onChange={handleChange} placeholder={doctor ? "Leave blank to keep current password" : ""} />
            <CustomInput id="phone" label="Phone" icon={Phone} value={formData.phone} onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset className="p-4 border rounded-xl">
          <legend className="font-semibold">Professional Info</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <CustomInput id="specialty" label="Specialty" icon={Stethoscope} value={formData.specialty} onChange={handleChange} />
            <CustomInput id="qualifications" label="Qualifications (comma-separated)" icon={Briefcase} value={formData.qualifications} onChange={handleChange} />
            <CustomInput id="yearsOfExperience" label="Years of Experience" type="number" icon={Calendar} value={formData.yearsOfExperience} onChange={handleChange} />
            <CustomInput id="consultationFee" label="Consultation Fee" type="number" icon={DollarSign} value={formData.consultationFee} onChange={handleChange} />
            <CustomInput id="languages" label="Languages (comma-separated)" icon={Languages} value={formData.languages} onChange={handleChange} />
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Doctor Bio..." className="w-full p-2 border rounded-xl mt-2"></textarea>
            <CustomInput id="profilePicture" label="Profile Picture" type="file" icon={ImageIcon} onChange={handleChange} />
            <CustomInput id="notes" label="Admin Notes" icon={FileText} value={formData.notes} onChange={handleChange} />
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Weekly Schedule</h3>
            {formData.schedule.map((s, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 mb-2">
                <select value={s.day} onChange={(e) => handleScheduleChange(idx, "day", e.target.value)} className="border p-2 rounded-xl">
                  <option value="">Select Day</option>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" value={s.startTime} onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)} className="border p-2 rounded-xl" />
                <input type="time" value={s.endTime} onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)} className="border p-2 rounded-xl" />
                <button type="button" className="text-red-500 font-bold" onClick={() => removeScheduleRow(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addScheduleRow} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl">Add Day</button>
          </div>
        </fieldset>

        <div className="flex justify-end mt-4">
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-xl">
            {isLoading ? "Processing..." : doctor ? "Update Doctor" : "Add Doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}

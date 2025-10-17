import React, { useState, useEffect } from "react";
import axios from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { User, FileText, Edit, Save, X, Calendar, Droplets, Activity, AlertTriangle, Pill } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
  });
  const [history, setHistory] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    chronicDiseases: [],
    pastSurgeries: [],
    familyHistory: [],
    allergies: [],
    medications: [],
    notes: "",
  });
  const [message, setMessage] = useState("");

  // Fetch user data
  useEffect(() => {
    if (user && user.id) {
      (async () => {
        try {
          console.log("Fetching user details for:", user.id);
          const res = await axios.get(`/users/${user.id}`);
          const data = res.data;

          console.log("User data fetched:", data);

          // set user details
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            profileImage: data.profileImage || "",
            password: "",
            confirmPassword: "",
          });

          // fetch patient history if exists
          if (data.patientHistory) {
            const h = await axios.get(`/patientHistories/${data?.patientHistory._id}`);
            setHistory(h.data);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      })();
    }
  }, [user]);

  // Handle general info update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage("❌ Passwords do not match");
    }

    try {
      await axios.put(`/users/${user._id}`, formData);
      setMessage("✅ Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating profile");
    }
  };

  // Handle patient history update
  const handleHistoryUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/patientHistories/${history._id || user.patientHistory}`, history);
      setMessage("✅ Patient history updated");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating history");
    }
  };

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="text-blue-600" size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-600">{label}</p>
        <p className="text-blue-900 font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );

  const TagList = ({ icon: Icon, label, items }) => (
    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="text-blue-600" size={18} />
        <p className="text-sm font-semibold text-blue-600">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {item}
            </span>
          ))
        ) : (
          <span className="text-blue-500 text-sm">None</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 transition-all duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent tracking-tight">
            Patient Profile
          </h1>
          <p className="text-blue-600 text-lg mt-2">Manage your personal and medical information</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100 mb-8"
        >
          <div className="flex border-b border-blue-200">
            <button
              className={`flex items-center gap-3 py-4 px-6 font-semibold transition-all duration-300 ${
                activeTab === "details"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-blue-400 hover:text-blue-600"
              }`}
              onClick={() => {
                setActiveTab("details");
                setIsEditing(false);
              }}
            >
              <User size={20} />
              Personal Details
            </button>
            <button
              className={`flex items-center gap-3 py-4 px-6 font-semibold transition-all duration-300 ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-blue-400 hover:text-blue-600"
              }`}
              onClick={() => {
                setActiveTab("history");
                setIsEditing(false);
              }}
            >
              <FileText size={20} />
              Medical History
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 mx-6 mt-4 rounded-xl text-center font-semibold ${
              message.includes("❌") 
                ? "bg-red-50 text-red-600 border border-red-200" 
                : "bg-green-50 text-green-600 border border-green-200"
            }`}>
              {message}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* TAB 1 - Profile Details */}
            {activeTab === "details" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField icon={User} label="Full Name" value={formData.name} />
                      <InfoField icon={User} label="Email" value={formData.email} />
                      <InfoField icon={User} label="Phone" value={formData.phone} />
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Edit size={20} />
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Phone</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Save size={20} />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-3 px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* TAB 2 - Patient History */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField 
                        icon={Calendar} 
                        label="Date of Birth" 
                        value={history.dateOfBirth ? new Date(history.dateOfBirth).toLocaleDateString() : "Not set"} 
                      />
                      <InfoField icon={User} label="Gender" value={history.gender} />
                      <InfoField icon={Droplets} label="Blood Group" value={history.bloodGroup} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TagList icon={Activity} label="Chronic Diseases" items={history.chronicDiseases} />
                      <TagList icon={AlertTriangle} label="Allergies" items={history.allergies} />
                      <TagList icon={Activity} label="Past Surgeries" items={history.pastSurgeries} />
                      <TagList icon={Pill} label="Medications" items={history.medications} />
                    </div>

                    {history.notes && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm font-semibold text-blue-600 mb-2">Additional Notes</p>
                        <p className="text-blue-900">{history.notes}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Edit size={20} />
                      Edit Medical History
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleHistoryUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={history.dateOfBirth?.split("T")[0] || ""}
                          onChange={(e) => setHistory({ ...history, dateOfBirth: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Gender</label>
                        <select
                          value={history.gender || ""}
                          onChange={(e) => setHistory({ ...history, gender: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Blood Group</label>
                        <input
                          type="text"
                          value={history.bloodGroup || ""}
                          onChange={(e) => setHistory({ ...history, bloodGroup: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Chronic Diseases (comma separated)</label>
                        <input
                          type="text"
                          value={history.chronicDiseases.join(", ")}
                          onChange={(e) => setHistory({ ...history, chronicDiseases: e.target.value.split(",").map((x) => x.trim()) })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Allergies (comma separated)</label>
                        <input
                          type="text"
                          value={history.allergies.join(", ")}
                          onChange={(e) => setHistory({ ...history, allergies: e.target.value.split(",").map((x) => x.trim()) })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Past Surgeries (comma separated)</label>
                        <input
                          type="text"
                          value={history.pastSurgeries.join(", ")}
                          onChange={(e) => setHistory({ ...history, pastSurgeries: e.target.value.split(",").map((x) => x.trim()) })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Medications (comma separated)</label>
                        <input
                          type="text"
                          value={history.medications.join(", ")}
                          onChange={(e) => setHistory({ ...history, medications: e.target.value.split(",").map((x) => x.trim()) })}
                          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Additional Notes</label>
                      <textarea
                        value={history.notes}
                        onChange={(e) => setHistory({ ...history, notes: e.target.value })}
                        rows={4}
                        className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Save size={20} />
                        Save Medical History
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-3 px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
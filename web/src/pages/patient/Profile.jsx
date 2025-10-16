import React, { useState, useEffect } from "react";
import axios from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

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
            const data = res.data; // already correct

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
            console.log("Fetching patient history for:", data.patientHistory);
            const h = await axios.get(`/patientHistories/${data.patientHistory}`);
            console.log("Patient history fetched:", h.data);
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
      await axios.put(`/patienthistory/${history._id || user.patientHistory}`, history);
      setMessage("✅ Patient history updated");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating history");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Patient Profile</h1>

      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "details"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("details");
            setIsEditing(false);
          }}
        >
          Personal Details
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("history");
            setIsEditing(false);
          }}
        >
          Patient History
        </button>
      </div>

      {message && (
        <div className="mb-4 text-center text-sm text-green-600">{message}</div>
      )}

      {/* TAB 1 - Profile Details */}
      {activeTab === "details" && (
        <div>
          {!isEditing ? (
            <div>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{formData.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>{formData.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone:</p>
                  <p>{formData.phone || "Not provided"}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2 - Patient History */}
      {activeTab === "history" && (
        <div>
          {!isEditing ? (
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>Date of Birth:</strong>{" "}
                {history.dateOfBirth
                  ? new Date(history.dateOfBirth).toLocaleDateString()
                  : "Not set"}
              </p>
              <p>
                <strong>Gender:</strong> {history.gender || "Not set"}
              </p>
              <p>
                <strong>Blood Group:</strong> {history.bloodGroup || "Not set"}
              </p>
              <p>
                <strong>Chronic Diseases:</strong>{" "}
                {history.chronicDiseases.length
                  ? history.chronicDiseases.join(", ")
                  : "None"}
              </p>
              <p>
                <strong>Allergies:</strong>{" "}
                {history.allergies.length ? history.allergies.join(", ") : "None"}
              </p>
              <p>
                <strong>Past Surgeries:</strong>{" "}
                {history.pastSurgeries.length
                  ? history.pastSurgeries.join(", ")
                  : "None"}
              </p>
              <p>
                <strong>Notes:</strong> {history.notes || "No notes"}
              </p>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit History
              </button>
            </div>
          ) : (
            <form onSubmit={handleHistoryUpdate} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">
                  Chronic Diseases (comma separated)
                </label>
                <input
                  type="text"
                  value={history.chronicDiseases.join(", ")}
                  onChange={(e) =>
                    setHistory({
                      ...history,
                      chronicDiseases: e.target.value
                        .split(",")
                        .map((x) => x.trim()),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={history.allergies.join(", ")}
                  onChange={(e) =>
                    setHistory({
                      ...history,
                      allergies: e.target.value
                        .split(",")
                        .map((x) => x.trim()),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Past Surgeries (comma separated)
                </label>
                <input
                  type="text"
                  value={history.pastSurgeries.join(", ")}
                  onChange={(e) =>
                    setHistory({
                      ...history,
                      pastSurgeries: e.target.value
                        .split(",")
                        .map((x) => x.trim()),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Notes</label>
                <textarea
                  value={history.notes}
                  onChange={(e) =>
                    setHistory({ ...history, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

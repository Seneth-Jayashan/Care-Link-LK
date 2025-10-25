import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import api from "../../api/api";
import {
  Search,
  QrCode,
  User,
  Heart,
  Edit,
  Save,
  X,
  Loader2,
  CalendarPlus
} from "lucide-react";
import EditableField from "../../components/ui/EditableField"; // Ensure correct path
import MedicationManager from "../../components/ui/MedicationManager"; // Ensure correct path
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

export default function Patient() {
  const navigate = useNavigate(); 
  const [searchInput, setSearchInput] = useState("");
  const [patient, setPatient] = useState(null); // Stores the user details (name, email, phone)
  const [record, setRecord] = useState(null); // Stores the full patient history record
  const [message, setMessage] = useState({ text: "", type: "error" });

  // QR Scanning
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // --- State for Appointments (doctorDetails removed) ---
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch by Email ---
  const fetchPatientByEmail = async () => {
    if (!searchInput) {
      setMessage({ text: "Please enter a patient email to search.", type: "error" });
      return;
    }
    setMessage({ text: "Searching...", type: "info" });
    setPatient(null);
    setRecord(null);

    try {
      const res = await api.get(`/patientHistories/email/${searchInput}`);
      const data = res.data.userHistory;
      if (data && data.user && typeof data.user === 'object') {
        setPatient(data.user);
        setRecord(data);
        setMessage({ text: "", type: "" });
      } else {
         setPatient(null);
         setRecord(data); 
         setMessage({ text: "Patient record found, but user details might be incomplete.", type: "warning" });
      }
    } catch (err) {
      console.error("Fetch by Email Error:", err);
      setPatient(null);
      setRecord(null);
      setMessage({ text: "❌ Patient not found with that email.", type: "error" });
    }
  };

  // --- Fetch by QR / ID ---
  const fetchPatientById = async (recordId) => {
    setMessage({ text: "Fetching data from QR...", type: "info" });
    setPatient(null);
    setRecord(null);
    try {
      const res = await api.post("/patientHistories/scan", { patientHistoryId: recordId });
      const data = res.data;

      if (data && data.user && typeof data.user === 'object') {
        setPatient(data.user);
        setRecord(data);
        setMessage({ text: "", type: "" });
      } else {
         setPatient(null);
         setRecord(data);
         setMessage({ text: "Patient record found via QR, but user details might be incomplete.", type: "warning" });
      }
    } catch (err) {
      console.error("Fetch by QR Error:", err);
      setPatient(null);
      setRecord(null);
      throw new Error("Could not fetch patient from QR code.");
    }
  };

  // --- QR Scan Logic ---
  useEffect(() => {
    if (!scanMode) {
     clearInterval(scanIntervalRef.current);
     setScanning(false);
     return;
    }

    scanIntervalRef.current = setInterval(() => {
     if (!webcamRef.current || scanning) return;
     const imageSrc = webcamRef.current.getScreenshot();
     if (!imageSrc) return;

     const img = new Image();
     img.src = imageSrc;
     img.onload = () => {
       const canvas = document.createElement("canvas");
       canvas.width = img.width;
       canvas.height = img.height;
       const ctx = canvas.getContext("2d");
       ctx.drawImage(img, 0, 0);
       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
       const code = jsQR(imageData.data, canvas.width, canvas.height);
       if (code?.data) {
         setScanning(true);
         handleQRData(code.data);
       }
     };
    }, 500);

    return () => clearInterval(scanIntervalRef.current);
  }, [scanMode, scanning]);


  const handleQRData = async (data) => {
    try {
      let recordId = data;
      try {
        const qrJSON = JSON.parse(data);
        recordId = qrJSON.patientHistoryId || qrJSON.recordId;
      } catch (e) { /* Assume plain ID if not JSON */ }
      if (!recordId) throw new Error("Invalid QR code format: Missing ID");

      await fetchPatientById(recordId);
      setScanMode(false);
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: "error" });
    } finally {
      setScanning(false);
    }
  };

  // --- REMOVED useEffect for fetchDoctorDetails ---

  // --- Editing Logic ---
  const handleEdit = () => {
    if (!record) return;
    setEditableRecord(JSON.parse(JSON.stringify(record)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditableRecord(null);
    setIsEditing(false);
  };

  const handleSaveRecord = async () => {
    if (!editableRecord || !record?._id) return;

    setIsSaving(true);
    setMessage({ text: "Saving...", type: "info" });
    try {
      const res = await api.put(`/patientHistories/doctor/${record._id}`, editableRecord);
      setRecord(res.data);
      setIsEditing(false);
      setEditableRecord(null);
      setMessage({ text: "✅ Patient record updated successfully!", type: "success" });
    } catch (err) {
      console.error("Save Error:", err);
      setMessage({ text: `❌ Failed to save changes: ${err.response?.data?.message || err.message}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific field in the editable record
  const handleFieldChange = (field, value) => {
    setEditableRecord((prev) => ({ ...prev, [field]: value }));
  };

  // Update array fields (like allergies, diseases) from comma-separated input
  const handleArrayFieldChange = (field, value) => {
    const newArray = value.split(",").map((item) => item.trim()).filter(Boolean);
    setEditableRecord((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !appointmentReason) {
      setMessage({ text: "Please select a date, time, and reason.", type: "error" });
      return;
    }
    // UPDATED: Removed check for doctorDetails
    if (!patient) {
       setMessage({ text: "Patient data is missing. Cannot book.", type: "error" });
       return;
    }

    setIsBooking(true);
    setMessage({ text: "Booking appointment...", type: "info" });

    try {
      // UPDATED: Removed hospital ID. The backend must now handle this.
      const appointmentData = {
        patient: patient._id, 
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: appointmentReason,
      };

      const res = await api.post("/appointments/doctor", appointmentData); 

      
      setMessage({ text: "", type: "" }); // Clear any loading/error messages
      
      Swal.fire({
        icon: "success",
        title: "Appointment Booked!",
        text: "The new appointment has been successfully created.",
        timer: 2000, // Show for 2 seconds
        showConfirmButton: false,
      }).then(() => {
        // Navigate to the appointments page after the alert closes
        // Assuming your appointments page route is '/doctor/appointments'
        navigate("/doctor/appointments"); 
      });
      setSelectedDate("");
      setSelectedTime("");
      setAppointmentReason("");
    } catch (err) {
      console.error("Booking Error:", err);
      setMessage({ text: `❌ Failed to book: ${err.response?.data?.message || err.message}`, type: "error" });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Find & Manage Patient Record
          </h1>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Enter patient email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchPatientByEmail}
              className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Search
            </button>
            <button
              onClick={() => setScanMode(!scanMode)}
              className="px-5 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <QrCode size={18} /> {scanMode ? "Close Scanner" : "Scan QR"}
            </button>
          </div>

          {scanMode && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-100">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full rounded-md"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                Point camera at the patient's QR code.
              </p>
            </div>
         )}

          {message.text && (
            <div
              className={`text-sm mb-4 p-3 rounded-lg ${
                message.type === "success" ? "bg-green-100 text-green-800" :
                message.type === "info" ? "bg-blue-100 text-blue-800" :
                message.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Display Patient Data Only If Found */}
          {patient && record && (
            <div className="mt-8 space-y-6">
              {/* Patient Info */}
              <div className="p-5 border rounded-xl bg-gray-50/50">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                      <User className="text-blue-500" /> Patient Information
                    </h2>
                    <p><strong>Name:</strong> {patient.name || "N/A"}</p>
                    <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {patient.phone || "Not set"}</p>
                    <p><strong>Gender:</strong> {record.gender || "Not set"}</p>
                    <p><strong>DOB:</strong> {record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : "Not set"}</p>
                    <p><strong>Blood Group:</strong> {record.bloodGroup || "Not set"}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {!isEditing ? (
                      <button onClick={handleEdit} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 flex items-center gap-2">
                        <Edit size={16} /> Edit Record
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleSaveRecord} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400">
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                        </button>
                        <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-lg border hover:bg-gray-100 flex items-center gap-2">
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="p-5 border rounded-xl space-y-4">
                <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <Heart className="text-red-500" /> Medical History
      _         </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Chronic Diseases"
                    value={ isEditing ? editableRecord.chronicDiseases.join(", ") : record.chronicDiseases?.join(", ") || ""}
                    onChange={(e) => handleArrayFieldChange("chronicDiseases", e.target.value)}
                    isEditing={isEditing}
                  />
                  <EditableField
                    label="Allergies"
                    value={ isEditing ? editableRecord.allergies.join(", ") : record.allergies?.join(", ") || ""}
                    onChange={(e) => handleArrayFieldChange("allergies", e.target.value)}
                    isEditing={isEditing}
                  />
                  <EditableField
                    label="Past Surgeries"
                    value={ isEditing ? editableRecord.pastSurgeries.join(", ") : record.pastSurgeries?.join(", ") || ""}
AN                   onChange={(e) => handleArrayFieldChange("pastSurgeries", e.target.value)}
                    isEditing={isEditing}
                  />
                  <EditableField
                    label="Family History"
                    value={ isEditing ? editableRecord.familyHistory.join(", ") : record.familyHistory?.join(", ") || ""}
IC                   onChange={(e) => handleArrayFieldChange("familyHistory", e.target.value)}
                    isEditing={isEditing}
                  />
                </div>

                <MedicationManager
                  medications={ isEditing ? editableRecord.medications : record.medications || []}
                  onUpdate={(newMeds) => handleFieldChange("medications", newMeds)}
                  isEditing={isEditing}
                />

                <EditableField
                  label="Doctor's Notes"
                  value={isEditing ? editableRecord.notes : record.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  isEditing={isEditing}
                  type="textarea"
                />
              </div>

              {/* UPDATED: Removed conditional rendering */}
              <div className="p-5 border rounded-xl space-y-4">
                <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <CalendarPlus className="text-blue-500" /> Book Next Appointment
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input 
              _         type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input 
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                    <input 
                      type="text"
                      placeholder="e.g., Follow-up checkup"
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            _       />
                  </div>
                  
                  <button
                    onClick={handleBookAppointment}
                    disabled={isBooking || !selectedDate || !selectedTime || !appointmentReason}
                    className="w-full px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {isBooking ? <Loader2 size={18} className="animate-spin" /> : "Book Appointment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!patient && !record && !message.text.includes("Searching") && message.text.includes("not found") && (
            <div className="text-center py-10">
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
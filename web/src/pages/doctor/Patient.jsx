import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import api from "../../api/api";
import { Search, QrCode, User, Heart, Edit, Save, X, Loader2 } from 'lucide-react';
import EditableField from "../../components/ui/EditableField";
import MedicationManager from "../../components/ui/MedicationManager";

export default function Patient() {
  const [searchInput, setSearchInput] = useState("");
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "error" });
  
  // State for QR Scanning
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableHistory, setEditableHistory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Fetching ---
  const fetchPatientByEmail = async () => {
    if (!searchInput) {
        setMessage({ text: "Please enter a patient email to search.", type: "error" });
        return;
    }
    setMessage({ text: "", type: "" });
    try {
      const res = await api.get(`/patientHistories/email/${searchInput}`);
      const data = res.data.userHistory;
      setPatient(data.user || data);
      setHistory(data);
    } catch (err) {
      console.error(err);
      setPatient(null);
      setHistory(null);
      setMessage({ text: "❌ Patient not found with that email.", type: "error" });
    }
  };
  
  const fetchPatientById = async (patientHistoryId) => {
    try {
        const res = await api.post("/patientHistories/scan", { patientHistoryId });
        const dataRes = res.data;
        setPatient(dataRes.user || dataRes);
        setHistory(dataRes);
        setMessage({ text: "", type: "" });
    } catch (err) {
        console.error(err);
        throw new Error("Could not fetch patient from QR code.");
    }
  };

  // --- QR Code Scanning Logic ---
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
      let patientHistoryId = data;
      try {
        const qrJSON = JSON.parse(data);
        patientHistoryId = qrJSON.patientHistoryId;
      } catch (e) { /* Not JSON, assume plain ID */ }

      if (!patientHistoryId) throw new Error("Invalid QR code format");
      
      await fetchPatientById(patientHistoryId);
      setScanMode(false);
    } catch (err) {
      console.error(err);
      setMessage({ text: `❌ ${err.message}`, type: "error" });
    } finally {
        setScanning(false);
    }
  };

  // --- Editing Logic ---
  const handleEdit = () => {
    setEditableHistory(JSON.parse(JSON.stringify(history)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditableHistory(null);
    setIsEditing(false);
  };

  const handleSaveHistory = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await api.put(`/patientHistories/doctor/${history._id}`, editableHistory);
      setHistory(res.data);
      setIsEditing(false);
      setEditableHistory(null);
      setMessage({ text: "✅ Patient history updated successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ Failed to save changes.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditableHistory(prev => ({ ...prev, [field]: value }));
  };
  
  const handleArrayFieldChange = (field, value) => {
    const newArray = value.split(',').map(item => item.trim()).filter(Boolean);
    setEditableHistory(prev => ({ ...prev, [field]: newArray }));
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Find & Manage Patient Record</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Enter patient email" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={fetchPatientByEmail} className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              Search
            </button>
            <button onClick={() => setScanMode(!scanMode)} className="px-5 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2">
              <QrCode size={18} /> {scanMode ? "Close Scanner" : "Scan QR"}
            </button>
          </div>
          
          {scanMode && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-100">
              <Webcam
                audio={false} ref={webcamRef} screenshotFormat="image/png"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full rounded-md"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                Point camera at the patient's QR code.
              </p>
            </div>
          )}

          {message.text && (
            <div className={`text-sm mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {patient && history && (
            <div className="mt-8 space-y-6">
              <div className="p-5 border rounded-xl bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                      <User className="text-blue-500"/> Patient Information
                    </h2>
                    <p><strong>Name:</strong> {patient.name}</p>
                    <p><strong>Email:</strong> {patient.email}</p>
                    <p><strong>Phone:</strong> {patient.phone || "Not set"}</p>
                  </div>
                  {!isEditing ? (
                    <button onClick={handleEdit} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 flex items-center gap-2">
                      <Edit size={16}/> Edit Record
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveHistory} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save
                      </button>
                      <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-lg border hover:bg-gray-100 flex items-center gap-2">
                        <X size={16}/> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border rounded-xl space-y-4">
                <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <Heart className="text-red-500"/> Medical History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Chronic Diseases" value={isEditing ? editableHistory.chronicDiseases.join(', ') : history.chronicDiseases?.join(', ') || ''} onChange={(e) => handleArrayFieldChange('chronicDiseases', e.target.value)} isEditing={isEditing} />
                  <EditableField label="Allergies" value={isEditing ? editableHistory.allergies.join(', ') : history.allergies?.join(', ') || ''} onChange={(e) => handleArrayFieldChange('allergies', e.target.value)} isEditing={isEditing} />
                  <EditableField label="Past Surgeries" value={isEditing ? editableHistory.pastSurgeries.join(', ') : history.pastSurgeries?.join(', ') || ''} onChange={(e) => handleArrayFieldChange('pastSurgeries', e.target.value)} isEditing={isEditing} />
                  <EditableField label="Family History" value={isEditing ? editableHistory.familyHistory.join(', ') : history.familyHistory?.join(', ') || ''} onChange={(e) => handleArrayFieldChange('familyHistory', e.target.value)} isEditing={isEditing} />
                </div>
                
                <MedicationManager 
                  medications={isEditing ? editableHistory.medications : history.medications}
                  onUpdate={(newMeds) => handleFieldChange('medications', newMeds)}
                  isEditing={isEditing}
                />

                <EditableField label="Doctor's Notes" value={isEditing ? editableHistory.notes : history.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} isEditing={isEditing} type="textarea" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
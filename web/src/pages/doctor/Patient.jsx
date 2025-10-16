import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import api from "../../api/api";

export default function Patient() {
  const [searchInput, setSearchInput] = useState("");
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [prescription, setPrescription] = useState("");
  const [message, setMessage] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);

  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Fetch patient by email
  const fetchPatientByEmail = async () => {
    if (!searchInput) return setMessage("Enter patient email or scan QR code");

    try {
      const res = await api.get(`/patients/${searchInput}`);
      const data = res.data;
      setPatient(data.user || data);
      setHistory(data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Patient not found");
    }
  };

  // QR scan using webcam + jsQR
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
          setScanning(true); // prevent multiple scans
          handleQRData(code.data);
        }
      };
    }, 500);

    return () => clearInterval(scanIntervalRef.current);
  }, [scanMode, scanning]);

  const handleQRData = async (data) => {
    try {
      // Parse QR code JSON if needed
      let patientHistoryId = data;
      try {
        const qrJSON = JSON.parse(data);
        patientHistoryId = qrJSON.patientHistoryId;
      } catch (e) {
        // not JSON, assume plain ID
      }

      if (!patientHistoryId) throw new Error("Invalid QR code");

      const res = await api.post("/patientHistories/scan", { patientHistoryId });
      const dataRes = res.data;
      setPatient(dataRes.user || dataRes);
      setHistory(dataRes);
      setMessage("");
      setScanMode(false);
      setScanning(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching patient from QR code");
      setScanning(false);
    }
  };

  // Add prescription / update patient history
  const addPrescription = async () => {
    if (!prescription) return setMessage("Enter prescription");

    try {
      const updates = {
        medications: [...(history?.medications || []), prescription],
      };
      const res = await api.put(`/patients/doctor/${history._id}`, updates);
      setHistory(res.data);
      setPrescription("");
      setMessage("✅ Prescription added");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding prescription");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Patient Details</h1>

      {/* Search & QR Buttons */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter patient email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button
          onClick={fetchPatientByEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={() => setScanMode(!scanMode)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {scanMode ? "Close Scanner" : "Scan QR"}
        </button>
      </div>

      {/* QR Scanner */}
      {scanMode && (
        <div className="mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={{ facingMode: "environment" }}
            className="w-full rounded"
          />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Point your camera at patient's QR code
          </p>
        </div>
      )}

      {message && <div className="text-sm mb-4 text-red-600">{message}</div>}

      {/* Patient Info & History */}
      {patient && history && (
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="p-4 border rounded">
            <h2 className="font-semibold text-lg">Patient Info</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Phone:</strong> {patient.phone || "Not set"}</p>
          </div>

          {/* Patient History */}
          <div className="p-4 border rounded space-y-1">
            <h2 className="font-semibold text-lg">Patient History</h2>
            <p><strong>DOB:</strong> {history.dateOfBirth ? new Date(history.dateOfBirth).toLocaleDateString() : "Not set"}</p>
            <p><strong>Gender:</strong> {history.gender || "Not set"}</p>
            <p><strong>Blood Group:</strong> {history.bloodGroup || "Not set"}</p>
            <p><strong>Chronic Diseases:</strong> {history.chronicDiseases?.join(", ") || "None"}</p>
            <p><strong>Allergies:</strong> {history.allergies?.join(", ") || "None"}</p>
            <p><strong>Past Surgeries:</strong> {history.pastSurgeries?.join(", ") || "None"}</p>
            <p><strong>Family History:</strong> {history.familyHistory?.join(", ") || "None"}</p>
            <p><strong>Medications:</strong> {history.medications?.join(", ") || "None"}</p>
            <p><strong>Notes:</strong> {history.notes || "None"}</p>
          </div>

          {/* Add Prescription */}
          <div className="p-4 border rounded space-y-2">
            <h2 className="font-semibold text-lg">Add Prescription</h2>
            <input
              type="text"
              placeholder="Enter new prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={addPrescription}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

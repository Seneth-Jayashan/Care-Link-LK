import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  QrCode,
  Loader2,
  Hospital,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

const LoginPage = () => {
  const { login, loginQR } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [scanMode, setScanMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleBasedRedirect = (role) => {
    switch (role) {
      case "patient":
        navigate("/patient");
        break;
      case "doctor":
        navigate("/doctor");
        break;
      case "hospitaladmin":
        navigate("/hospital");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${res.user.name || "User"} 👋`,
          timer: 2000,
          showConfirmButton: false,
        });
        handleRoleBasedRedirect(res.user.role);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: res.message || "Invalid email or password.",
        });
        setErrors({ submit: res.message });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- QR Code Scanning Logic ---
  useEffect(() => {
    if (!scanMode) {
      clearInterval(scanIntervalRef.current);
      setIsScanning(false);
      return;
    }

    scanIntervalRef.current = setInterval(() => {
      if (!webcamRef.current || isScanning) return;
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
          setIsScanning(true);
          handleQRData(code.data);
        }
      };
    }, 500);

    return () => clearInterval(scanIntervalRef.current);
  }, [scanMode, isScanning]);

  const handleQRData = async (data) => {
    setIsLoading(true);
    setScanMode(false);

    try {
      const credentials = JSON.parse(data);
      const { email, userId } = credentials;
      if (!email || !userId) throw new Error("Invalid credentials in QR code.");

      const res = await loginQR(email, userId);
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "QR Login Successful!",
          text: `Welcome ${res.user.name || ""}`,
          timer: 2000,
          showConfirmButton: false,
        });
        handleRoleBasedRedirect(res.user.role);
      } else {
        Swal.fire({
          icon: "error",
          title: "QR Login Failed",
          text: res.message || "Could not log in using QR code.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Invalid QR Code",
        text: "The scanned QR code is not valid.",
      });
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Hospital className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard.</p>
        </div>

        {!scanMode ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl transition ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-6 relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>

            <button
              onClick={() => setScanMode(true)}
              className="w-full bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
            >
              <QrCode size={20} /> Login with QR Code
            </button>
          </>
        ) : (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: "environment" }}
              className="w-full rounded-xl border-4 border-gray-200"
            />
            <p className="text-center text-gray-600 mt-4">
              Point your device's camera at the QR code.
            </p>
            <button
              onClick={() => setScanMode(false)}
              className="w-full mt-4 bg-white text-gray-700 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;

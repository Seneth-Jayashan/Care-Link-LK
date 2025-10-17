import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Camera, 
  Loader2,
  Eye,
  EyeOff,
  Heart,
  AlertCircle,
  List,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import api from "../../api/api";

const PatientManagement = () => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'add'
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, patient: null });

  // Form state - KEEPING THE EXACT SAME FORM STRUCTURE
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profileImage: null,
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    currentMedications: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  // ------------------- 📋 GET PATIENTS -------------------
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // Filter only patients
      const patientUsers = response.data.filter(user => user.role === 'patient');
      setPatients(patientUsers);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setMessage('❌ Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchPatients();
  }, [activeTab]);

  // ------------------- 🗑️ DELETE PATIENT -------------------
  const handleDeletePatient = async (patientId) => {
    try {
      await api.delete(`/users/${patientId}`);
      setMessage('✅ Patient deleted successfully!');
      fetchPatients(); // Refresh the list
      setDeleteConfirm({ show: false, patient: null });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setMessage(`❌ Error deleting patient: ${errorMsg}`);
      setDeleteConfirm({ show: false, patient: null });
    }
  };

  // ------------------- ➕ ADD PATIENT FORM (EXACT SAME AS BEFORE) -------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profileImage') {
      setFormData(prev => ({
        ...prev,
        profileImage: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'confirmPassword') return;
        
        if (key === 'profileImage' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('role', 'patient');
      
      const response = await api.post('/users', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Patient registration response:', response.data);
      setMessage('✅ Patient registered successfully!');
      fetchPatients(); // Refresh the patient list
      
      // Reset form and switch to view tab
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        profileImage: null,
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        address: '',
        emergencyContact: '',
        medicalConditions: '',
        allergies: '',
        currentMedications: ''
      });
      
      setActiveTab('view');
    } catch (error) {
      console.error('Registration error:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Error registering patient. Please try again.';
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- UI COMPONENTS -------------------
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

  // ------------------- FILTERED PATIENTS -------------------
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------- MAIN UI -------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <User size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Patient Management</h1>
                <p className="text-blue-100">Manage patient accounts and medical information</p>
              </div>
            </div>

            {/* Sliding Menu */}
            <div className="flex bg-white/20 rounded-xl backdrop-blur-md overflow-hidden">
              {[
                { id: 'view', label: 'View Details', icon: List },
                { id: 'add', label: 'Add Patient', icon: Plus },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
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
                  message.includes('Error')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------------------- VIEW TAB ------------------- */}
          <AnimatePresence mode="wait">
            {activeTab === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
              >
                <SectionHeader
                  icon={List}
                  title="Registered Patients"
                  subtitle="All patients currently in the system"
                />

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search patients by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-gray-700">
                    <Filter size={18} />
                    Filter
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-20 text-blue-600">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Loading patients...
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No matching patients found" : "No patients found"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first patient"}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                      >
                        <Plus size={18} />
                        Add First Patient
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-blue-50 text-blue-700">
                        <tr>
                          <th className="py-4 px-6 text-left font-semibold">Patient</th>
                          <th className="py-4 px-6 text-left font-semibold">Contact</th>
                          <th className="py-4 px-6 text-left font-semibold">Blood Group</th>
                          <th className="py-4 px-6 text-left font-semibold">Registered</th>
                          <th className="py-4 px-6 text-center font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient, index) => (
                          <motion.tr
                            key={patient._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-semibold text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500">{patient.email}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <span>{patient.phone || 'Not provided'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Heart size={16} className="text-red-500" />
                                <span className="font-medium">{patient.bloodGroup || 'Not specified'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <span>{new Date(patient.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Edit Patient"
                                >
                                  <Edit3 size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setDeleteConfirm({ show: true, patient })}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Patient"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Stats Summary */}
                {filteredPatients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 bg-gray-50 rounded-xl"
                  >
                    <p className="text-sm text-gray-600 text-center">
                      Showing {filteredPatients.length} of {patients.length} patients
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ------------------- ADD TAB ------------------- */}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* KEEPING THE EXACT SAME PATIENT REGISTRATION FORM AS BEFORE */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <SectionHeader 
                      icon={User} 
                      title="Basic Information" 
                      subtitle="Personal details and account setup"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter full name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter email address"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.phone ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter phone number"
                          />
                        </div>
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name="profileImage"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div>
                    <SectionHeader 
                      icon={User} 
                      title="Personal Details" 
                      subtitle="Essential information for medical records"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            errors.gender ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Gender</option>
                          {genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group *
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                        {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="tel"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Emergency contact number"
                          />
                        </div>
                        {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${
                            errors.address ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter complete address"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div>
                    <SectionHeader 
                      icon={Heart} 
                      title="Medical Information" 
                      subtitle="Health details for better care (optional but recommended)"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Conditions
                        </label>
                        <textarea
                          name="medicalConditions"
                          value={formData.medicalConditions}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                          placeholder="List any existing medical conditions (e.g., Diabetes, Hypertension, Asthma)..."
                        />
                        <p className="mt-1 text-sm text-gray-500">Separate multiple conditions with commas</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allergies
                        </label>
                        <textarea
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleChange}
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                          placeholder="List any allergies (e.g., Penicillin, Peanuts, Dust)..."
                        />
                        <p className="mt-1 text-sm text-gray-500">Separate multiple allergies with commas</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Medications
                        </label>
                        <textarea
                          name="currentMedications"
                          value={formData.currentMedications}
                          onChange={handleChange}
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                          placeholder="List any current medications with dosages..."
                        />
                        <p className="mt-1 text-sm text-gray-500">Include medication names and dosages</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-yellow-800">Important Information</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          All information provided will be kept confidential and used solely for medical purposes. 
                          Please ensure all details are accurate for proper healthcare delivery.
                        </p>
                      </div>
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
                          <Loader2 className="animate-spin" size={20} />
                          Registering Patient...
                        </>
                      ) : (
                        <>
                          <User size={20} />
                          Register Patient
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm({ show: false, patient: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Patient</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.patient?.name}</strong>? 
                This will permanently remove the patient and all their medical data from the system.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm({ show: false, patient: null })}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePatient(deleteConfirm.patient?._id)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Patient
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientManagement;
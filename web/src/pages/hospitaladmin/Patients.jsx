import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, Heart, AlertCircle, List, Plus,
  Search, Filter, Edit3, Trash2, Calendar, X, Loader2, Eye, EyeOff
} from 'lucide-react';
import api from "../../api/api";

// Reusable Input Component for Forms
const InputGroup = ({ label, name, value, onChange, error, icon: Icon, type = 'text', ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${Icon ? 'pl-10' : 'px-4'} ${error ? 'border-red-300' : 'border-gray-300'}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);


// Modal for Viewing and Editing Patient Details
const PatientDetailModal = ({ modalState, onClose, onSave, fetchPatients }) => {
    const { isOpen, mode, patient } = modalState;
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Pre-fill form when patient data is available
        if (patient) {
            setFormData({
                name: patient.name || '',
                email: patient.email || '',
                phone: patient.phone || '',
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
                gender: patient.gender || '',
                bloodGroup: patient.bloodGroup || '',
                address: patient.address || '',
                emergencyContact: patient.emergencyContact || '',
                medicalConditions: patient.medicalConditions || '',
                allergies: patient.allergies || '',
                currentMedications: patient.currentMedications || '',
            });
        }
    }, [patient]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(patient._id, formData);
            fetchPatients(); // Refresh list on successful save
            onClose();
        } catch (error) {
            console.error("Failed to update patient:", error);
            // Optionally, show an error message within the modal
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!isOpen) return null;

    const isEditMode = mode === 'edit';

    const renderField = (label, value) => (
        <div className="py-2">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md text-gray-800">{value || 'N/A'}</p>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Patient Details' : 'Patient Details'}</h2>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {isEditMode ? (
                                    <>
                                        <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                                        <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                                        <InputGroup label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                                        <InputGroup label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                                        <InputGroup label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
                                        <InputGroup label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                                        <InputGroup label="Emergency Contact" name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={handleChange} />
                                        <div className="md:col-span-2">
                                          <InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} />
                                        </div>
                                        <div className="md:col-span-2">
                                          <InputGroup label="Medical Conditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} />
                                        </div>
                                        <div className="md:col-span-2">
                                          <InputGroup label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                                        </div>
                                        <div className="md:col-span-2">
                                          <InputGroup label="Current Medications" name="currentMedications" value={formData.currentMedications} onChange={handleChange} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Full Name', patient.name)}
                                        {renderField('Email', patient.email)}
                                        {renderField('Phone', patient.phone)}
                                        {renderField('Date of Birth', patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A')}
                                        {renderField('Gender', patient.gender)}
                                        {renderField('Blood Group', patient.bloodGroup)}
                                        {renderField('Emergency Contact', patient.emergencyContact)}
                                        <div className="md:col-span-2">{renderField('Address', patient.address)}</div>
                                        <div className="md:col-span-2">{renderField('Medical Conditions', patient.medicalConditions)}</div>
                                        <div className="md:col-span-2">{renderField('Allergies', patient.allergies)}</div>
                                        <div className="md:col-span-2">{renderField('Current Medications', patient.currentMedications)}</div>
                                    </>
                                )}
                            </div>
                            
                            {isEditMode && (
                                <div className="flex justify-end gap-4 mt-8">
                                    <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Edit3 size={18} />}
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const PatientManagement = () => {
    const [activeTab, setActiveTab] = useState('view');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Unified modal state
    const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', patient: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, patient: null });

    // Form state for adding a new patient
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '', profileImage: null,
        dateOfBirth: '', gender: '', bloodGroup: '', address: '', emergencyContact: '',
        medicalConditions: '', allergies: '', currentMedications: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            const patientUsers = response.data.filter(user => user.role === 'patient');
            setPatients(patientUsers);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setMessage('❌ Failed to load patients');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'view') {
            fetchPatients();
        }
    }, [activeTab, fetchPatients]);

    const handleUpdatePatient = async (patientId, updatedData) => {
        try {
            await api.put(`/users/${patientId}`, updatedData);
            setMessage('✅ Patient details updated successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update patient.';
            setMessage(`❌ ${errorMsg}`);
            throw err; // Re-throw to handle in modal
        }
    };
    
    const handleDeletePatient = async (patientId) => {
        try {
            await api.delete(`/users/${patientId}`);
            setMessage('✅ Patient deleted successfully!');
            fetchPatients(); // Refresh the list
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete patient.';
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setDeleteConfirm({ show: false, patient: null });
        }
    };
    
    const handleView = async (patient) => {
        try {
            const res = await api.get(`/users/${patient._id}`);
            setModalState({ isOpen: true, mode: 'view', patient: res.data });
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to load patient details");
        }
    };

    const handleEdit = async (patient) => {
        try {
            const res = await api.get(`/users/${patient._id}`);
            setModalState({ isOpen: true, mode: 'edit', patient: res.data });
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to load patient for editing");
        }
    };
    
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profileImage') {
            setFormData(prev => ({ ...prev, profileImage: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        setMessage('');

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'confirmPassword' && formData[key]) {
                submitData.append(key, formData[key]);
            }
        });
        submitData.append('role', 'patient');
        
        try {
            await api.post('/users', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('✅ Patient registered successfully!');
            fetchPatients();
            // Reset form and switch tab
            setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '', profileImage: null, dateOfBirth: '', gender: '', bloodGroup: '', address: '', emergencyContact: '', medicalConditions: '', allergies: '', currentMedications: '' });
            setErrors({});
            setActiveTab('view');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error registering patient.';
            setMessage(`❌ ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <div className="flex bg-white/20 rounded-xl backdrop-blur-md overflow-hidden">
                            {[
                                { id: 'view', label: 'View Details', icon: List },
                                { id: 'add', label: 'Add Patient', icon: Plus },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className={`mb-6 p-4 rounded-xl border ${message.includes('❌') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence mode="wait">
                        {activeTab === 'view' && (
                            <motion.div key="view" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                      <input
                                        type="text"
                                        placeholder="Search patients by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                      <Filter size={18} />
                                      Filter
                                    </button>
                                </div>
                                
                                {loading ? (
                                  <div className="flex justify-center items-center py-20 text-blue-600"><Loader2 className="animate-spin mr-2" />Loading...</div>
                                ) : filteredPatients.length === 0 ? (
                                    <div className="text-center py-12">
                                        <User className="mx-auto text-gray-400 mb-4" size={48} />
                                        <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
                                        <p className="text-gray-500 mb-6">Get started by adding your first patient.</p>
                                        <button onClick={() => setActiveTab('add')} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 mx-auto">
                                            <Plus size={18} /> Add Patient
                                        </button>
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
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{patient.name}</div>
                                                            <div className="text-sm text-gray-500">{patient.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600">{patient.phone || 'N/A'}</td>
                                                    <td className="py-4 px-6 font-medium">{patient.bloodGroup || 'N/A'}</td>
                                                    <td className="py-4 px-6 text-gray-600">{new Date(patient.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => handleView(patient)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details"><Eye size={16} /></button>
                                                            <button onClick={() => handleEdit(patient)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Edit Patient"><Edit3 size={16} /></button>
                                                            <button onClick={() => setDeleteConfirm({ show: true, patient })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Patient"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'add' && (
                            <motion.div key="add" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Full Name *" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Enter full name" />
                                    <InputGroup label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Enter email" icon={Mail} />
                                    <InputGroup label="Password *" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} error={errors.password} placeholder="Enter password" icon={Lock} />
                                    <InputGroup label="Confirm Password *" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm password" icon={Lock} />
                                    <InputGroup label="Phone Number *" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="Enter phone" icon={Phone} />
                                    <InputGroup label="Profile Image" name="profileImage" type="file" onChange={handleChange} accept="image/*" />
                                    <InputGroup label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                                    <div>
                                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                                        <option value="">Select Gender</option>
                                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                                        <option value="">Select Blood Group</option>
                                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                      </select>
                                    </div>
                                    <InputGroup label="Emergency Contact" name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency contact" icon={Phone} />
                                    <div className="md:col-span-2">
                                        <InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter complete address" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputGroup label="Medical Conditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="e.g., Diabetes, Hypertension" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputGroup label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Penicillin, Peanuts" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputGroup label="Current Medications" name="currentMedications" value={formData.currentMedications} onChange={handleChange} placeholder="e.g., Metformin 500mg" />
                                    </div>
                                  </div>
                                  <div className="flex justify-center pt-6">
                                    <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg">
                                        {isSubmitting ? (<><Loader2 className="animate-spin" size={20} /> Registering...</>) : (<><User size={20} /> Register Patient</>)}
                                    </button>
                                  </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Modals */}
            <PatientDetailModal
                modalState={modalState}
                onClose={() => setModalState({ isOpen: false, mode: 'view', patient: null })}
                onSave={handleUpdatePatient}
                fetchPatients={fetchPatients}
            />

            <AnimatePresence>
                {deleteConfirm.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteConfirm({ show: false, patient: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <div className="flex items-center gap-3 mb-4">
                               <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                 <Trash2 className="text-red-600" size={20} />
                               </div>
                               <div>
                                 <h3 className="text-lg font-semibold text-gray-900">Delete Patient</h3>
                                 <p className="text-sm text-gray-500">This action is permanent</p>
                               </div>
                             </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{deleteConfirm.patient?.name}</strong>? All their data will be removed.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteConfirm({ show: false, patient: null })} className="px-4 py-2 text-gray-700 rounded-lg border hover:bg-gray-50 font-medium">Cancel</button>
                                <button onClick={() => handleDeletePatient(deleteConfirm.patient?._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium">
                                    <Trash2 size={16} /> Delete
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
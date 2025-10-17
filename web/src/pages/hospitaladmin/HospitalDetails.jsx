import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    Building,
    MapPin,
    Phone,
    Mail,
    Users,
    Star,
    FileText,
    List,
    Loader2,
    Edit2,
    AlertTriangle,
    X,
    HeartPulse,
    Sparkles,
} from "lucide-react";
import api from "../../api/api"; // centralized axios instance

// ------------------- Reusable Components (Color Updated) -------------------

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-4 mb-6">
        {/* Updated icon container background and shadow */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, item }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-4 border border-blue-100"
            >
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center mr-4 shadow-inner">
                        <AlertTriangle className="text-red-500" size={22} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">Confirm Deletion</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Are you sure you want to delete the record for **{item}**? This
                            action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={onConfirm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-md"
                    >
                        <Trash2 size={16} />
                        Delete
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, ...props }) => (
    <div>
        <label htmlFor={name} className="block mb-1.5 text-sm font-medium text-gray-700">
            {label}
        </label>
        <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            // Focus ring color changed to match theme
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            {...props}
        />
    </div>
);


// ------------------- Main Component -------------------

export default function HospitalManagement() {
    const [activeTab, setActiveTab] = useState("view");
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" }); // {text, type: 'success' | 'error'}

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = JSON.parse(localStorage.getItem('authUser')); 
    const initialFormData = {
        name: "",
        code: "",
        address: {
            street: "",
            city: "",
            district: "",
            province: "",
            postalCode: "",
            country: "Sri Lanka",
        },
        contact: { phone: "", email: "" },
        departments: [{ name: "", description: "" }],
        bedCapacity: "",
        facilities: [""],
        rating: "",
        notes: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- UTILS & API LOGIC (NO CHANGES BELOW) ---
    const resetFormData = () => setFormData(initialFormData);

    const showMessage = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 5000); 
    };

    useEffect(() => {
        let fetched = false;

        const fetchHospital = async () => {
            if (fetched) return;
            fetched = true;

            try {
                setLoading(true);
                const myHospital = await api.get(`/users/${user.id}`);
                const hospitalId = myHospital.data.hospital?._id;

                if (!hospitalId) {
                    setHospital(null);
                    setActiveTab("add");
                    return;
                }

                const res = await api.get(`/hospitals/${hospitalId}`);
                setHospital(res.data);
                setActiveTab("view");
            } catch (err) {
                console.error(err);
                showMessage("Failed to load hospital data. Please try again.", "error");
                setActiveTab("add");
            } finally {
                setLoading(false);
            }
        };

        fetchHospital();
    }, []);


    const handleDeleteConfirm = () => setIsDeleting(true);

    const deleteHospitalApi = async () => {
        if (!hospital) return;
        setIsSubmitting(true);
        setIsDeleting(false);

        try {
            await api.delete(`/hospitals/${hospital._id}`);
            showMessage(`Hospital "${hospital.name}" deleted successfully!`);
            setHospital(null);
            setActiveTab("add");
            resetFormData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            showMessage(`Error deleting hospital: ${errorMsg}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = () => {
        if (!hospital) return;
        setFormData({
            ...initialFormData,
            ...hospital,
            address: hospital.address || initialFormData.address,
            contact: hospital.contact || initialFormData.contact,
            departments: hospital.departments?.length ? hospital.departments : initialFormData.departments,
            facilities: hospital.facilities?.length ? hospital.facilities : initialFormData.facilities,
        });
        setIsEditing(true);
        setActiveTab("add");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [section, key] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [section]: { ...prev[section], [key]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleDepartmentChange = (index, field, value) => {
        const updated = [...formData.departments];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, departments: updated }));
    };
    const addDepartment = () =>
        setFormData((prev) => ({
            ...prev,
            departments: [...prev.departments, { name: "", description: "" }],
        }));
    const removeDepartment = (index) =>
        setFormData((prev) => ({
            ...prev,
            departments: prev.departments.filter((_, i) => i !== index),
        }));

    const handleFacilityChange = (index, value) => {
        const updated = [...formData.facilities];
        updated[index] = value;
        setFormData((prev) => ({ ...prev, facilities: updated }));
    };
    const addFacility = () =>
        setFormData((prev) => ({ ...prev, facilities: [...prev.facilities, ""] }));
    const removeFacility = (index) =>
        setFormData((prev) => ({
            ...prev,
            facilities: prev.facilities.filter((_, i) => i !== index),
        }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEditing) {
                const res = await api.put(`/hospitals/${hospital._id}`, formData);
                setHospital(res.data);
                showMessage("Hospital updated successfully!");
            } else {
                const res = await api.post("/hospitals", formData);
                setHospital(res.data);
                showMessage("Hospital created successfully!");
            }
            setIsEditing(false);
            setActiveTab("view");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            showMessage(`Error: ${errorMsg}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    // -------------------------------------------------------------------

    // --- UI RENDER (The main changes are here) ---
    const renderViewContent = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={Building} title={hospital.name} subtitle={`Code: ${hospital.code}`} />

            {/* Information Grid with clean backgrounds and shadows */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> Address</h4>
                    <p className="text-gray-700">{hospital.address.street}, {hospital.address.city}, {hospital.address.district}</p>
                    <p className="text-gray-700">{hospital.address.province}, {hospital.address.country}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Phone size={16} className="text-blue-500" /> Contact</h4>
                    <p className="text-gray-700">Phone: {hospital.contact.phone}</p>
                    <p className="text-gray-700">Email: {hospital.contact.email}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Users size={16} className="text-blue-500" /> Capacity</h4>
                    <p className="text-gray-700 text-lg font-bold">{hospital.bedCapacity} Beds</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Rating</h4>
                    <p className="text-gray-700 text-lg font-bold">{hospital.rating || "N/A"} / 5</p>
                </div>
            </div>

            {/* Departments */}
            <div>
                <h4 className="font-semibold text-blue-800 mb-3 text-xl flex items-center gap-2 border-b pb-2"><HeartPulse size={20} className="text-blue-500" /> Departments</h4>
                <div className="flex flex-wrap gap-3">
                    {hospital.departments?.map((dept, i) => <div key={i} className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full shadow-inner transition hover:bg-blue-200">{dept.name}</div>)}
                </div>
            </div>

            {/* Facilities */}
            <div>
                <h4 className="font-semibold text-blue-800 mb-3 text-xl flex items-center gap-2 border-b pb-2"><Sparkles size={20} className="text-yellow-500" /> Facilities</h4>
                <div className="flex flex-wrap gap-2">
                    {hospital.facilities?.map((facility, i) => <div key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm transition hover:bg-green-200">{facility}</div>)}
                </div>
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Notes</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-600 italic">{hospital.notes || "No additional notes."}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between  mt-8">
                <motion.button 
                    onClick={startEdit} 
                    whileHover={{ scale: 1.05 }} 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                    <Edit2 size={16} /> Edit Details
                </motion.button>
                <motion.button 
                    onClick={handleDeleteConfirm} 
                    whileHover={{ scale: 1.05 }} 
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Trash2 size={16} /> Delete Hospital
                </motion.button>
            </div>
        </motion.div>
    );

    const renderFormComponent = () => (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={isEditing ? Edit2 : Plus} title={isEditing ? 'Edit Hospital' : 'Add New Hospital'} subtitle="Fill in the details below" />

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Hospital Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., General Hospital Colombo" required />
                <InputField label="Hospital Code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., GHC001" required />
                <InputField label="Phone" name="contact.phone" value={formData.contact.phone} onChange={handleChange} placeholder="011-1234567" />
                <InputField label="Email" type="email" name="contact.email" value={formData.contact.email} onChange={handleChange} placeholder="info@hospital.lk" />
            </div>

            {/* Address Section */}
            <div>
                <label className="block mb-2 text-sm font-bold text-gray-800">Address Details</label>
                <div className="grid md:grid-cols-2 gap-4 p-4 border border-blue-100 bg-blue-50 rounded-lg">
                    <input type="text" name="address.street" placeholder="Street" value={formData.address.street} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    <input type="text" name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    <input type="text" name="address.district" placeholder="District" value={formData.address.district} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    <input type="text" name="address.province" placeholder="Province" value={formData.address.province} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Bed Capacity" type="number" name="bedCapacity" value={formData.bedCapacity} onChange={handleChange} placeholder="e.g., 500" />
                <InputField label="Rating (1-5)" type="number" name="rating" min="1" max="5" step="0.1" value={formData.rating} onChange={handleChange} placeholder="e.g., 4.5" />
            </div>

            {/* Departments Section */}
            <div className="space-y-4 p-5 border border-blue-200 rounded-lg bg-white shadow-sm">
                <label className="block text-lg font-bold text-blue-800">Departments</label>
                {formData.departments.map((dept, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3">
                        <input type="text" placeholder="Department Name" value={dept.name} onChange={(e) => handleDepartmentChange(index, 'name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <motion.button type="button" onClick={() => removeDepartment(index)} whileHover={{ scale: 1.1 }} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-all flex-shrink-0"><Trash2 size={18} /></motion.button>
                    </motion.div>
                ))}
                <button type="button" onClick={addDepartment} className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline transition"><Plus size={16} /> Add Department</button>
            </div>

            {/* Facilities Section */}
            <div className="space-y-4 p-5 border border-blue-200 rounded-lg bg-white shadow-sm">
                <label className="block text-lg font-bold text-blue-800">Facilities</label>
                {formData.facilities.map((facility, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <input type="text" placeholder="e.g., MRI Scanner" value={facility} onChange={(e) => handleFacilityChange(index, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <motion.button type="button" onClick={() => removeFacility(index)} whileHover={{ scale: 1.1 }} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-all flex-shrink-0"><Trash2 size={18} /></motion.button>
                    </motion.div>
                ))}
                <button type="button" onClick={addFacility} className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline transition"><Plus size={16} /> Add Facility</button>
            </div>

            <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Any additional notes..." />
            </div>

            {/* Submit Button */}
            <div className=" flex gap-2 items-center justify-between ">
            <motion.button 
                type="submit" 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                disabled={isSubmitting} 
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:from-blue-400 disabled:to-blue-300"
            >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                {isSubmitting ? "Saving..." : isEditing ? "Update Hospital" : "Create Hospital"}
            </motion.button>
            
            {/* Cancel Edit Button */}
            {isEditing && (
                <motion.button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setActiveTab("view"); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition-all ml-4"
                >
                    Cancel Edit
                </motion.button>
            )}
            </div>
        </motion.form>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4 sm:px-6 lg:px-8">
            <motion.div
                layout
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100"
            >
                {/* Header (Matching the DoctorsPage style) */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center shadow-md">
                            <Building size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Hospital Management</h1>
                            <p className="text-blue-100 text-sm">View or update your hospital's details</p>
                        </div>
                    </div>
                    
                    {/* Tabs (Matching the DoctorsPage style) */}
                    <div className="flex bg-white/20 rounded-xl p-1 shadow-inner">
                        <TabButton
                            id="view"
                            label="Details"
                            icon={List}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            disabled={!hospital}
                        />
                        {(!hospital || isEditing) && ( // Show 'Add' if no hospital or 'Edit' if editing
                            <TabButton
                                id="add"
                                label={isEditing ? "Edit Form" : "Add"}
                                icon={isEditing ? Edit2 : Plus}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                onClick={() => !isEditing && resetFormData()}
                            />
                        )}
                    </div>
                </div>

                {/* --- 📣 Message Bar --- */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className={`px-6 py-3 text-sm font-bold text-white ${
                                message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-6 md:p-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-20 gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <span className="text-xl text-gray-600 font-medium">Loading Hospital Data...</span>
                        </div>
                    ) : activeTab === "view" && hospital ? (
                        renderViewContent()
                    ) : (
                        renderFormComponent()
                    )}
                </div>
            </motion.div>

            <ConfirmationDialog
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={deleteHospitalApi}
                item={hospital?.name}
            />
        </div>
    );
}

// Tab Button Component (Color theme adjusted)
const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, disabled, onClick }) => (
    <button
        onClick={() => {
            if (disabled) return;
            setActiveTab(id);
            if (onClick) onClick();
        }}
        className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-xl ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'text-white hover:bg-white/10'
        }`}
    >
        {activeTab === id && (
            <motion.div
                layoutId="activeTab"
                // Match the Doctor's page background: clean white tab with blue text
                className="absolute inset-0 bg-white rounded-xl z-0 shadow-md" 
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
        )}
        <span className={`relative z-10 ${activeTab === id ? 'text-blue-700 font-bold' : ''}`}><Icon size={16} /></span>
        <span className={`relative z-10 ${activeTab === id ? 'text-blue-700 font-bold' : ''}`}>{label}</span>
    </button>
);
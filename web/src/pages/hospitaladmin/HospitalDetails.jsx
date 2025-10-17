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
import { useNavigate } from "react-router-dom"; // 👈 Import useNavigate
import Swal from "sweetalert2"; // 👈 Import SweetAlert2
import api from "../../api/api";

// ------------------- Reusable Components -------------------
// (No changes to your reusable components: SectionHeader, ConfirmationDialog, InputField)

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
      <Icon className="text-blue-600" size={24} />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, item }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-4"
      >
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center mr-4">
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
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            {...props}
        />
    </div>
);

// ------------------- Main Component -------------------

export default function HospitalManagement() {
  const navigate = useNavigate(); // 👈 Initialize useNavigate
  const [activeTab, setActiveTab] = useState("view");
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = JSON.parse(localStorage.getItem("authUser"));
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

  // ------------------- 🧹 UTILS -------------------
  const resetFormData = () => setFormData(initialFormData);
  
  // ------------------- 🏥 API -------------------
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
        Swal.fire({ // 👈 Use Swal for error feedback
            icon: 'error',
            title: 'Loading Failed',
            text: 'Could not load hospital data. Please try again.'
        });
        setActiveTab("add");
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [user.id]); // Added user.id to dependency array for correctness


  // ------------------- DELETE -------------------
  const handleDeleteConfirm = () => setIsDeleting(true);

  const deleteHospitalApi = async () => {
    if (!hospital) return;
    setIsSubmitting(true);
    setIsDeleting(false);

    try {
      await api.delete(`/hospitals/${hospital._id}`);
      await Swal.fire({ // 👈 Use Swal for success feedback
        icon: 'success',
        title: 'Deleted!',
        text: `Hospital "${hospital.name}" was deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      setHospital(null);
      setActiveTab("add");
      resetFormData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      Swal.fire({ // 👈 Use Swal for error feedback
        icon: 'error',
        title: 'Deletion Failed',
        text: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- EDIT -------------------
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

  // ------------------- FORM HANDLERS -------------------
  // (No changes to form handlers: handleChange, department, and facility handlers)
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

  // ------------------- SUBMIT -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        const res = await api.put(`/hospitals/${hospital._id}`, formData);
        setHospital(res.data);
        Swal.fire({ // 👈 Use Swal for update success
          icon: 'success',
          title: 'Updated!',
          text: 'Hospital details updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        setIsEditing(false);
        setActiveTab("view");
      } else {
        const res = await api.post("/hospitals", formData);
        setHospital(res.data);
        await Swal.fire({ // 👈 Use Swal for creation success
          icon: 'success',
          title: 'Created!',
          text: 'Hospital created successfully!',
          timer: 1500, // Shorter timer before redirect
          showConfirmButton: false,
        });
        navigate("/hospital"); // 👈 REDIRECT on success
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      Swal.fire({ // 👈 Use Swal for submission errors
        icon: 'error',
        title: 'Submission Error',
        text: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- UI RENDER -------------------
  // (No changes to render functions: renderViewContent, renderFormComponent)
  const renderViewContent = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <SectionHeader icon={Building} title={hospital.name} subtitle={`Code: ${hospital.code}`} />

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> Address</h4>
                <p className="text-gray-600">{hospital.address.street}, {hospital.address.city}, {hospital.address.district}</p>
                <p className="text-gray-600">{hospital.address.province}, {hospital.address.country}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Phone size={16}/> Contact</h4>
                <p className="text-gray-600">Phone: {hospital.contact.phone}</p>
                <p className="text-gray-600">Email: {hospital.contact.email}</p>
            </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Users size={16}/> Capacity</h4>
                <p className="text-gray-600">{hospital.bedCapacity} Beds</p>
            </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Star size={16}/> Rating</h4>
                <p className="text-gray-600">{hospital.rating || "N/A"} / 5</p>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><HeartPulse size={20}/> Departments</h4>
            <div className="space-y-2">
                {hospital.departments?.map((dept, i) => <div key={i} className="p-3 bg-blue-50 rounded-md">{dept.name}</div>)}
            </div>
        </div>
        
        <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><Sparkles size={20}/> Facilities</h4>
            <div className="flex flex-wrap gap-2">
                {hospital.facilities?.map((facility, i) => <div key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{facility}</div>)}
            </div>
        </div>
        
        <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText size={16}/> Notes</h4>
            <p className="text-gray-600 italic">{hospital.notes || "No additional notes."}</p>
        </div>
        
        <div className="flex gap-4 mt-6">
            <motion.button onClick={startEdit} whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Edit2 size={16} /> Edit Details
            </motion.button>
            <motion.button onClick={handleDeleteConfirm} whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                <Trash2 size={16} /> Delete Hospital
            </motion.button>
        </div>
    </motion.div>
  );

  const renderFormComponent = () => (
     <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <SectionHeader icon={isEditing ? Edit2 : Plus} title={isEditing ? 'Edit Hospital' : 'Add New Hospital'} subtitle="Fill in the details below"/>

        <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Hospital Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., General Hospital Colombo" required/>
            <InputField label="Hospital Code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., GHC001" required/>
            <InputField label="Phone" name="contact.phone" value={formData.contact.phone} onChange={handleChange} placeholder="011-1234567" />
            <InputField label="Email" type="email" name="contact.email" value={formData.contact.email} onChange={handleChange} placeholder="info@hospital.lk" />
        </div>
        
        {/* --- Address Section --- */}
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Address</label>
            <div className="grid md:grid-cols-2 gap-4">
                 <input type="text" name="address.street" placeholder="Street" value={formData.address.street} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                 <input type="text" name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                 <input type="text" name="address.district" placeholder="District" value={formData.address.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                 <input type="text" name="address.province" placeholder="Province" value={formData.address.province} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Bed Capacity" type="number" name="bedCapacity" value={formData.bedCapacity} onChange={handleChange} placeholder="e.g., 500" />
            <InputField label="Rating (1-5)" type="number" name="rating" min="1" max="5" step="0.1" value={formData.rating} onChange={handleChange} placeholder="e.g., 4.5" />
        </div>
        
        {/* --- ➕ Departments Section --- */}
        <div className="space-y-4 p-4 border rounded-lg">
             <label className="block text-sm font-medium text-gray-700">Departments</label>
             {formData.departments.map((dept, index) => (
                <div key={index} className="flex items-start gap-2">
                    <input type="text" placeholder="Department Name" value={dept.name} onChange={(e) => handleDepartmentChange(index, 'name', e.target.value)} className="w-full px-4 py-2 border rounded-lg"/>
                    <button type="button" onClick={() => removeDepartment(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={18}/></button>
                </div>
             ))}
             <button type="button" onClick={addDepartment} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"><Plus size={16}/> Add Department</button>
        </div>

        {/* --- ✨ Facilities Section --- */}
        <div className="space-y-4 p-4 border rounded-lg">
             <label className="block text-sm font-medium text-gray-700">Facilities</label>
             {formData.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input type="text" placeholder="e.g., MRI Scanner" value={facility} onChange={(e) => handleFacilityChange(index, e.target.value)} className="w-full px-4 py-2 border rounded-lg"/>
                    <button type="button" onClick={() => removeFacility(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={18}/></button>
                </div>
             ))}
             <button type="button" onClick={addFacility} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"><Plus size={16}/> Add Facility</button>
        </div>

        <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Any additional notes..."/>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400">
          {isSubmitting && <Loader2 className="animate-spin" size={18}/>}
          {isSubmitting ? "Saving..." : isEditing ? "Update Hospital" : "Create Hospital"}
        </motion.button>
    </motion.form>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        layout
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hospital Management</h1>
              <p className="text-blue-100 text-sm">View or update your hospital's details</p>
            </div>
          </div>
          <div className="flex bg-white/20 rounded-xl p-1">
            <TabButton
              id="view"
              label="Details"
              icon={List}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              disabled={!hospital}
            />
            {!hospital && (
              <TabButton
                id="add"
                label="Add"
                icon={Plus}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onClick={() => resetFormData()}
              />
            )}
          </div>
        </div>

        {/* --- Message Bar Removed --- */}
        {/* The old message bar is no longer needed as Swal handles notifications */}

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-gray-600">Loading Hospital Data...</span>
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

// (No changes to TabButton component)
const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, disabled, onClick }) => (
    <button
        onClick={() => {
            if (disabled) return;
            setActiveTab(id);
            if (onClick) onClick();
        }}
        className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'text-white hover:bg-white/10'
        }`}
    >
        {activeTab === id && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-lg z-0"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
        )}
        <span className={`relative z-10 ${activeTab === id ? 'text-blue-700' : ''}`}><Icon size={16} /></span>
        <span className={`relative z-10 ${activeTab === id ? 'text-blue-700' : ''}`}>{label}</span>
    </button>
);
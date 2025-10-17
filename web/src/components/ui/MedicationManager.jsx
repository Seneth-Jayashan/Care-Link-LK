import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const MedicationManager = ({ medications, onUpdate, isEditing }) => {
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage) return; // Basic validation
    onUpdate([...medications, { ...newMed, startDate: new Date() }]);
    setNewMed({ name: '', dosage: '', frequency: '' });
  };

  const handleRemoveMedication = (index) => {
    const updatedMeds = medications.filter((_, i) => i !== index);
    onUpdate(updatedMeds);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2">Medications / Prescriptions</label>
      <div className="space-y-2">
        {medications.length > 0 ? medications.map((med, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div>
              <p className="font-semibold text-gray-800">{med.name}</p>
              <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
            </div>
            {isEditing && (
              <button onClick={() => handleRemoveMedication(index)} className="p-1 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )) : (
          <p className="p-2 text-gray-400">No medications listed.</p>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <h4 className="font-semibold text-gray-700">Add New Prescription</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" placeholder="Medication Name" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} className="p-2 border rounded-md" />
            <input type="text" placeholder="Dosage (e.g., 500mg)" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="p-2 border rounded-md" />
            <input type="text" placeholder="Frequency (e.g., Twice a day)" value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="p-2 border rounded-md" />
          </div>
          <button onClick={handleAddMedication} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <PlusCircle size={18} /> Add Medication
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicationManager;
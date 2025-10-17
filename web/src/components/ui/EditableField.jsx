import React from 'react';

const EditableField = ({ label, value, onChange, isEditing, type = 'text' }) => {
  const commonClasses = "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  
  return (
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            className={`${commonClasses} min-h-[100px]`}
            rows={4}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            className={commonClasses}
          />
        )
      ) : (
        <p className="p-2 bg-gray-50 rounded-md min-h-[42px] text-gray-800">
          {value || <span className="text-gray-400">Not set</span>}
        </p>
      )}
    </div>
  );
};

export default EditableField;
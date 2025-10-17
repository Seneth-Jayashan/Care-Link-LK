import React from 'react';
import { Calendar, Clock, User, Building, Check, X, FileText, Loader2 } from 'lucide-react';

const DoctorAppointmentCard = ({ appointment, onStatusChange, isUpdating }) => {
  const { patient, hospital, appointmentDate, appointmentTime, status, reason } = appointment;

  const appointmentDateTime = new Date(`${appointmentDate.split('T')[0]}T${appointmentTime}`);
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const handleStatusUpdate = (newStatus) => {
    if (isUpdating) return;
    onStatusChange(appointment._id, newStatus);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              {patient?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">{patient?.email || 'No email'}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-gray-700">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-gray-400" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gray-400" />
            <span className="font-medium">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building size={18} className="text-gray-400" />
            <span>{hospital?.name || 'N/A'}</span>
          </div>
          {reason && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm"><strong>Reason:</strong> {reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'confirmed' && (
        <div className="bg-gray-50/50 p-3 flex gap-2 justify-end">
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition disabled:bg-gray-300 flex items-center gap-1.5"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Mark as Completed
          </button>
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition disabled:bg-gray-300 flex items-center gap-1.5"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentCard;
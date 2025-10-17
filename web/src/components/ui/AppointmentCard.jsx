import React from 'react';
import { Calendar, Clock, Stethoscope, Building, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AppointmentCard = ({ appointment }) => {
  const { doctor, hospital, appointmentDate, appointmentTime, status, reason, notes } = appointment;

  const appointmentDateTime = new Date(`${appointmentDate.split('T')[0]}T${appointmentTime}`);
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const statusInfo = {
    confirmed: {
      icon: <CheckCircle className="text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      label: 'Confirmed',
    },
    completed: {
      icon: <CheckCircle className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      label: 'Completed',
    },
    cancelled: {
      icon: <XCircle className="text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      label: 'Cancelled',
    },
    pending: {
      icon: <AlertTriangle className="text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      label: 'Pending Confirmation',
    },
  };

  const currentStatus = statusInfo[status] || statusInfo.pending;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className={`p-4 border-l-4 ${currentStatus.borderColor || 'border-gray-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
            <h3 className="text-xl font-bold text-gray-800">Dr. {doctor?.name || 'N/A'}</h3>
            <p className="text-gray-600 flex items-center gap-2">
              <Stethoscope size={16} /> {doctor?.doctorDetails?.specialty || 'Specialist'}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${currentStatus.bgColor} ${currentStatus.textColor}`}>
            {currentStatus.icon}
            <span>{currentStatus.label}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-gray-700">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-500" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building size={18} className="text-blue-500" />
            <span>{hospital?.name || 'N/A'}</span>
          </div>
          {reason && (
            <div className="flex items-start gap-3">
              <p className="text-sm font-medium text-gray-800">Reason:</p>
              <p className="text-sm">{reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
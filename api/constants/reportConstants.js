// constants/reportConstants.js

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  // Add other statuses as needed
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  // Add other statuses as needed
};

// Normalized versions for queries
export const NORM_APPOINTMENT_STATUS = {
    COMPLETED: APPOINTMENT_STATUS.COMPLETED.toLowerCase(),
};
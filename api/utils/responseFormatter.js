/**
 * Formats the user and token data for a standardized auth response.
 * @param {object} user - The Mongoose user document.
 * @param {string} token - The JWT.
 * @returns {object} The standardized response object.
 */
export const formatAuthResponse = (user, token) => {
  return {
    token, // Send token at the top level
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientHistory: user.patientHistory || null,
      doctorDetails: user.doctorDetails || null,
      hospital: user.hospital || null,
      // We remove the redundant 'token' from inside the user object
    },
  };
};
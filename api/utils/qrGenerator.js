import QRCode from 'qrcode';

export const generatePatientQR = async (patientData) => {
  try {
    // Encode patient data as JSON string
    const qrString = JSON.stringify(patientData);

    // Generate QR code as Data URL (can embed in email)
    const qrCodeDataUrl = await QRCode.toDataURL(qrString);

    return qrCodeDataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    throw err;
  }
};

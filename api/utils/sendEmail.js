// utils/sendEmail.js
import transporter from '../config/mailer.js'; // Import the configured transporter
import { generatePatientWelcomeHTML } from './emailTemplates.js'; // Import the template function
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends the patient welcome email including login credentials and an embedded QR code.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} qrDataUrl - The base64 Data URL of the QR code image.
 * @param {string} password - The temporary password for the user.
 */
export const sendEmailWithQR = async (to, subject, qrDataUrl, password) => {
  // Check if transporter is configured (it won't be in 'test' mode or if config failed)
  if (!transporter) {
    console.log('📧 Email sending skipped: Transporter not available (likely test mode or config error).');
    return;
  }

  try {
    // Extract base64 data (remove prefix)
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    if (!base64Data) {
        throw new Error("Invalid QR Data URL provided.");
    }

    // Define a unique Content-ID for embedding
    const qrImageCid = `patient-qr-${Date.now()}@yourappdomain.com`; // Make CID more unique

    // Generate HTML content using the template function
    const htmlContent = generatePatientWelcomeHTML(to, password, qrImageCid);

    // Define mail options
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`, // Use name and email
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          content: base64Data,
          encoding: 'base64',
          cid: qrImageCid // Use the defined CID
        }
      ]
    };

    // Send the email
    console.log(`📧 Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);

  } catch (err) {
    console.error(`❌ Error sending email to ${to}:`, err);
    // Re-throw the error so the calling function knows it failed
    // This allows services like createUserService to handle the failure if needed
    throw new Error(`Failed to send welcome email: ${err.message}`);
  }
};

// utils/emailTemplates.js

/**
 * Generates the HTML content for the patient account creation email with QR code.
 * @param {string} recipientEmail - The patient's email address.
 * @param {string} temporaryPassword - The generated password.
 * @param {string} qrImageCid - The Content-ID for the embedded QR image.
 * @returns {string} - The formatted HTML email body.
 */
export const generatePatientWelcomeHTML = (recipientEmail, temporaryPassword, qrImageCid) => {
  // Basic styling can be added inline
  const styles = {
    container: `font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; margin: auto;`,
    heading: `color: #0056b3;`,
    paragraph: `line-height: 1.6;`,
    strong: `color: #000;`,
    qrCode: `display: block; margin: 15px 0; border: 1px solid #ddd; padding: 5px;`,
    footer: `margin-top: 20px; font-size: 0.9em; color: #777;`
  };

  return `
    <div style="${styles.container}">
      <h3 style="${styles.heading}">Welcome to Care-Link!</h3>
      <p style="${styles.paragraph}">Your patient account has been successfully created.</p>
      <p style="${styles.paragraph}">Please use the following credentials to log in:</p>
      <p style="${styles.paragraph}"><strong style="${styles.strong}">Email:</strong> ${recipientEmail}</p>
      <p style="${styles.paragraph}"><strong style="${styles.strong}">Password:</strong> ${temporaryPassword}</p>
      <p style="${styles.paragraph}">Remember to change your password after your first login for security.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="${styles.paragraph}">Scan this QR code using our app or show it when visiting your doctor:</p>
      <img src="cid:${qrImageCid}" alt="Patient QR Code" style="${styles.qrCode} width:200px; height:200px;" />
      <p style="${styles.footer}">Please keep this QR code and your login details safe and do not share them.</p>
      <p style="${styles.footer}">Thank you,<br>The Care-Link Team</p>
    </div>
  `;
};

// Add other email template functions here as needed...
// export const generatePasswordResetHTML = (resetLink) => { ... };
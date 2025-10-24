import nodemailer from 'nodemailer';

export const sendEmailWithQR = async (to, subject, qrDataUrl, password) => {

  if (process.env.NODE_ENV === 'test') {
    console.log('📧 Email sending skipped in test mode');
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // --- NEW CODE STARTS HERE ---

    // 1. Extract the base64 part of the data URL
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    
    // 2. Define a unique Content-ID for the image
    const qrImageCid = 'patient-qr-code@sjaywebsolutions.lk'; 

    // --- NEW CODE ENDS HERE ---


    // Update the HTML to reference the CID
    const htmlContent = `
      <h3>Your patient account has been created</h3>
      <p>Login using your credentials:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Scan this QR code when visiting your doctor:</p>
      <img src="cid:${qrImageCid}" alt="Patient QR Code" style="width:250px;height:250px;" />
      <p>Keep this QR code safe!</p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: htmlContent,
      // Add the attachments array
      attachments: [
        {
          filename: 'qrcode.png',
          content: base64Data, // Pass the raw base64 data here
          encoding: 'base64',  // Specify the encoding
          cid: qrImageCid      // Assign the Content-ID
        }
      ]
    });

  } catch (err) {
    console.error('Error sending email:', err);
    throw err; // It's good practice to re-throw the error
  }
};
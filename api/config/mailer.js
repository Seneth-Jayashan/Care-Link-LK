// config/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

let transporter;

// Only configure the transporter if not in test mode
if (process.env.NODE_ENV !== 'test') {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      // secure: true is recommended for port 465, false for 587 (often uses STARTTLS)
      secure: process.env.SMTP_PORT === '465', // Adjust logic based on your provider
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Optional: Add connection timeout settings
      // connectionTimeout: 5000, // 5 seconds
      // greetingTimeout: 5000,
      // socketTimeout: 5000,
    });

    // Optional: Verify connection configuration on startup (logs error if fails)
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Mailer configuration error:', error);
        } else {
            console.log('✅ Mailer is configured and ready to send emails.');
        }
    });

  } catch (error) {
    console.error('❌ Failed to create mail transporter:', error);
    // You might want to handle this more gracefully depending on your app's needs
    // For now, transporter will remain undefined, preventing email sending.
  }
} else {
    console.log('✉️ Mailer disabled in test mode.');
    // In test mode, transporter remains undefined or you could assign a mock object.
}


export default transporter;
import nodemailer from 'nodemailer';

export const sendEmailWithQR = async (to, subject, qrDataUrl, password) => {
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

    const htmlContent = `
      <h2>Your patient account has been created</h2>
      <p>Login using your credentials:</p>
      <p><b>Email:</b> ${to}</p>
      <p><b>Password:</b> ${password}</p>
      <p>Scan this QR code when visiting your doctor:</p>
        <img src="${qrDataUrl}" alt="Patient QR Code" style="width:250px;height:250px;" />
      <p><b>Keep this QR code safe!</b></p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });

    console.log('Email sent successfully!');
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

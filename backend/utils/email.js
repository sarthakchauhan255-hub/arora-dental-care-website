const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplates = {
  otpEmail: (name, otp) => ({
    subject: 'Aurora Dental Care - OTP Verification',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">🦷 Aurora Dental Care</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Healthy Smile, Brighter Tomorrow.</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <h2 style="color: #0f172a; margin-top: 0;">Hello, ${name}!</h2>
          <p style="color: #475569; line-height: 1.7;">Your one-time password (OTP) for admin access is:</p>
          <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #0284c7;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">⏱️ This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email. Your account remains secure.</p>
        </div>
      </div>
    `,
  }),

  appointmentConfirmation: (appointment, service) => ({
    subject: `Appointment Confirmed - Aurora Dental Care`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🦷 Aurora Dental Care</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Healthy Smile, Brighter Tomorrow.</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <h2 style="color: #0f172a; margin-top: 0;">✅ Appointment Confirmed!</h2>
          <p style="color: #475569;">Dear <strong>${appointment.patient_name}</strong>, your appointment has been received.</p>
          <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Service</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${service || 'General Consultation'}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Time</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${appointment.appointment_time}</td></tr>
            </table>
          </div>
          <p style="color: #475569; font-size: 14px;">📍 <strong>Aurora Dental Care</strong> — 123 Smile Avenue, Suite 200, San Francisco, CA 94102</p>
          <p style="color: #475569; font-size: 14px;">📞 +1 (415) 555-0123</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px;">Please arrive 10 minutes early. To reschedule, call us at least 24 hours in advance.</p>
        </div>
      </div>
    `,
  }),

  adminNewBooking: (appointment, service) => ({
    subject: `🦷 New Appointment - ${appointment.patient_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #0284c7;">New Appointment Booked</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr style="background: #f0f9ff;"><td colspan="2" style="padding: 16px; font-weight: bold; color: #0284c7;">Patient Details</td></tr>
          <tr><td style="padding: 12px; color: #64748b; width: 40%;">Name</td><td style="padding: 12px; font-weight: 600;">${appointment.patient_name}</td></tr>
          <tr style="background: #fafafa;"><td style="padding: 12px; color: #64748b;">Email</td><td style="padding: 12px;">${appointment.patient_email}</td></tr>
          <tr><td style="padding: 12px; color: #64748b;">Phone</td><td style="padding: 12px;">${appointment.patient_phone}</td></tr>
          <tr style="background: #fafafa;"><td style="padding: 12px; color: #64748b;">Service</td><td style="padding: 12px; font-weight: 600;">${service || 'N/A'}</td></tr>
          <tr><td style="padding: 12px; color: #64748b;">Date</td><td style="padding: 12px; font-weight: 600;">${appointment.appointment_date}</td></tr>
          <tr style="background: #fafafa;"><td style="padding: 12px; color: #64748b;">Time</td><td style="padding: 12px; font-weight: 600;">${appointment.appointment_time}</td></tr>
          ${appointment.message ? `<tr><td style="padding: 12px; color: #64748b;">Message</td><td style="padding: 12px;">${appointment.message}</td></tr>` : ''}
        </table>
      </div>
    `,
  }),

  passwordResetOtp: (name, otp) => ({
    subject: 'Aurora Dental Care - Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🦷 Aurora Dental Care</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569;">Hello ${name}, use this OTP to reset your password:</p>
          <div style="background: #fff7ed; border: 2px solid #f97316; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #ea580c;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">⏱️ Expires in 5 minutes. If you did not request this, contact support immediately.</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async (to, template) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates };

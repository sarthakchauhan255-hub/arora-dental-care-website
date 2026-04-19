const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/email');
const { generateOTP, isOTPExpired, getOTPExpiry, canResendOTP, secondsUntilResend } = require('../utils/otp');

// Step 1: Validate email + password, send OTP
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Generic error for security
    const genericError = { success: false, message: 'Invalid credentials.' };

    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json(genericError);

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json(genericError);

    // Check resend cooldown
    if (admin.last_otp_sent && !canResendOTP(admin.last_otp_sent)) {
     const now = new Date();
     const last = new Date(admin.last_otp_sent);

     const diff = Math.floor((now - last) / 1000);

     return res.status(429).json({
     success: false,
     message: `Please wait ${Math.max(60 - diff, 0)} seconds before requesting a new OTP`
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await pool.query(
      'UPDATE admin SET otp = ?, otp_expires_at = ?, otp_attempts = 0, last_otp_sent = NOW() WHERE id = ?',
      [otp, otpExpiry, admin.id]
    );

    const emailResult = await sendEmail(admin.email, emailTemplates.otpEmail(admin.name, otp));
    if (!emailResult.success) {
      console.error('OTP email failed:', emailResult.error);
    }

    res.json({
      success: true,
      message: 'OTP sent to your email.',
      adminId: admin.id,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Step 2: Verify OTP, return JWT
const verifyOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;

    const [rows] = await pool.query('SELECT * FROM admin WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const admin = rows[0];
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

    if (admin.otp_attempts >= maxAttempts) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Request a new OTP.' });
    }

    if (!admin.otp || isOTPExpired(admin.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (admin.otp !== otp) {
      await pool.query('UPDATE admin SET otp_attempts = otp_attempts + 1 WHERE id = ?', [admin.id]);
      const remaining = maxAttempts - admin.otp_attempts - 1;
      return res.status(400).json({ success: false, message: `Incorrect OTP. ${remaining} attempts remaining.` });
    }

    // Clear OTP after successful verification
    await pool.query(
      'UPDATE admin SET otp = NULL, otp_expires_at = NULL, otp_attempts = 0, last_otp_sent = NULL WHERE id = ?',
     [admin.id]
    );

    const token = jwt.sign(
  { 
    id: admin.id, 
    email: admin.email, 
    name: admin.name,
    otpVerified: true
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { adminId } = req.body;

    const [rows] = await pool.query('SELECT * FROM admin WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Session not found.' });

    const admin = rows[0];

    if (admin.last_otp_sent && !canResendOTP(admin.last_otp_sent)) {
      const now = new Date();
      const last = new Date(admin.last_otp_sent);
      const diff = Math.floor((now - last) / 1000);

      return res.status(429).json({
       success: false,
       message: `Please wait ${Math.max(60 - diff, 0)} seconds before resending`
     });
    }
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await pool.query(
      'UPDATE admin SET otp = ?, otp_expires_at = ?, otp_attempts = 0, last_otp_sent = NOW() WHERE id = ?',
      [otp, otpExpiry, admin.id]
    );

    await sendEmail(admin.email, emailTemplates.otpEmail(admin.name, otp));
    res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Forgot password - send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    // Always respond with success for security
    if (rows.length === 0) {
      return res.json({ success: true, message: 'If this email exists, an OTP has been sent.' });
    }

    const admin = rows[0];

    if (!canResendOTP(admin.last_otp_sent)) {
      const wait = secondsUntilResend(admin.last_otp_sent);
      return res.status(429).json({ success: false, message: `Please wait ${wait} seconds.` });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await pool.query(
      'UPDATE admin SET otp = ?, otp_expires_at = ?, otp_attempts = 0, last_otp_sent = NOW() WHERE id = ?',
      [otp, otpExpiry, admin.id]
    );

    await sendEmail(admin.email, emailTemplates.passwordResetOtp(admin.name, otp));

    res.json({
      success: true,
      message: 'If this email exists, an OTP has been sent.',
      adminId: admin.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Reset password after OTP verification
const resetPassword = async (req, res) => {
  try {
    const { adminId, otp, newPassword } = req.body;

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 chars with uppercase, lowercase, number, and special character.',
      });
    }

    const [rows] = await pool.query('SELECT * FROM admin WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invalid request.' });

    const admin = rows[0];
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

    if (admin.otp_attempts >= maxAttempts) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    if (!admin.otp || isOTPExpired(admin.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }

    if (admin.otp !== otp) {
      await pool.query('UPDATE admin SET otp_attempts = otp_attempts + 1 WHERE id = ?', [admin.id]);
      return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE admin SET password = ?, otp = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE id = ?',
      [hashed, admin.id]
    );

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update credentials (requires current OTP verification)
const updateCredentials = async (req, res) => {
  try {
    const { newEmail, newPassword } = req.body;
    const adminId = req.admin.id;
   if (!req.admin || !req.admin.otpVerified){
     return res.status(403).json({
       success: false,
       message: 'OTP verification required'
     });
    }


    const updates = [];
    const values = [];

    if (newEmail) {
      const [existing] = await pool.query('SELECT id FROM admin WHERE email = ? AND id != ?', [newEmail, adminId]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
      updates.push('email = ?');
      values.push(newEmail);
    }

    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ success: false, message: 'Password does not meet requirements.' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      updates.push('password = ?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No changes to update.' });
    }

    values.push(adminId);
    await pool.query(
      `UPDATE admin SET ${updates.join(', ')}, otp = NULL, otp_expires_at = NULL, otp_attempts = 0, last_otp_sent = NULL WHERE id = ?`,
     values
    );

    res.json({ success: true, message: 'Credentials updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM admin WHERE id = ?', [req.admin.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found.' });
    res.json({ success: true, admin: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, verifyOTP, resendOTP, forgotPassword, resetPassword, updateCredentials, getProfile };

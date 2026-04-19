const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES) || 5;
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

const canResendOTP = (lastSent) => {
  if (!lastSent) return true;
  const cooldown = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
  const diff = (new Date() - new Date(lastSent)) / 1000;
  return diff >= cooldown;
};

const secondsUntilResend = (lastSent) => {
  if (!lastSent) return 0;
  const cooldown = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
  const diff = (new Date() - new Date(lastSent)) / 1000;
  return Math.max(0, Math.ceil(cooldown - diff));
};

module.exports = { generateOTP, isOTPExpired, getOTPExpiry, canResendOTP, secondsUntilResend };

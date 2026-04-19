const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { authenticateAdmin } = require('../middleware/auth');

const authController = require('../controllers/authController');
const appointmentController = require('../controllers/appointmentController');
const doctorController = require('../controllers/doctorController');
const { getAllServices, getServiceById, updateService, getApprovedReviews, getAllReviews, submitReview, approveReview, deleteReview } = require('../controllers/serviceReviewController');

const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many requests. Try again in 15 minutes.' } });
const bookingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { success: false, message: 'Too many booking attempts. Try again later.' } });
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { success: false, message: 'Too many review submissions.' } });

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// AUTH ROUTES
router.post('/auth/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').notEmpty().withMessage('Password required.'),
], validate, authController.login);

router.post('/auth/verify-otp', authLimiter, [
  body('adminId').isInt().withMessage('Invalid admin ID.'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits.'),
], validate, authController.verifyOTP);

router.post('/auth/resend-otp', authLimiter, [
  body('adminId').isInt().withMessage('Invalid admin ID.'),
], validate, authController.resendOTP);

router.post('/auth/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
], validate, authController.forgotPassword);

router.post('/auth/reset-password', authLimiter, [
  body('adminId').isInt().withMessage('Invalid admin ID.'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits.'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], validate, authController.resetPassword);

router.get('/auth/profile', authenticateAdmin, authController.getProfile);
router.put('/auth/credentials', authenticateAdmin, authController.updateCredentials);

// APPOINTMENTS
router.get('/appointments/slots', appointmentController.getAvailableSlots);

router.post('/appointments', bookingLimiter, [
  body('patient_name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('patient_email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('patient_phone').trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone number required.'),
  body('appointment_date').isDate().withMessage('Valid date required.'),
  body('appointment_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required.'),
], validate, appointmentController.bookAppointment);

router.get('/appointments', authenticateAdmin, appointmentController.getAllAppointments);
router.put('/appointments/:id/status', authenticateAdmin, appointmentController.updateAppointmentStatus);
router.get('/appointments/stats', authenticateAdmin, appointmentController.getDashboardStats);

// DOCTORS
router.get('/doctors', doctorController.getAllDoctors);
router.get('/doctors/:id', doctorController.getDoctorById);
router.post('/doctors', authenticateAdmin, [
  body('name').trim().notEmpty().withMessage('Name required.'),
  body('specialty').trim().notEmpty().withMessage('Specialty required.'),
], validate, doctorController.createDoctor);
router.put('/doctors/:id', authenticateAdmin, doctorController.updateDoctor);
router.delete('/doctors/:id', authenticateAdmin, doctorController.deleteDoctor);

// SERVICES
router.get('/services', getAllServices);
router.get('/services/:id', getServiceById);
router.put('/services/:id', authenticateAdmin, updateService);

// REVIEWS
router.get('/reviews', getApprovedReviews);
router.post('/reviews', reviewLimiter, [
  body('patient_name').trim().isLength({ min: 2, max: 100 }).withMessage('Name required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5.'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters.'),
], validate, submitReview);

router.get('/admin/reviews', authenticateAdmin, getAllReviews);
router.put('/admin/reviews/:id/approve', authenticateAdmin, approveReview);
router.delete('/admin/reviews/:id', authenticateAdmin, deleteReview);

module.exports = router;

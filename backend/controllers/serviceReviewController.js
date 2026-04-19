const { pool } = require('../config/database');

// SERVICES
const getAllServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json({ success: true, services: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ? AND is_active = TRUE', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateService = async (req, res) => {
  try {
    const { name, description, short_description, image_url, duration_minutes, price_range } = req.body;
    const [result] = await pool.query(
      'UPDATE services SET name=?, description=?, short_description=?, image_url=?, duration_minutes=?, price_range=? WHERE id=?',
      [name, description, short_description, image_url, duration_minutes, price_range, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// REVIEWS
const getApprovedReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, patient_name, rating, comment, created_at FROM reviews WHERE is_approved = TRUE ORDER BY created_at DESC LIMIT 20'
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const submitReview = async (req, res) => {
  try {
    const { patient_name, patient_email, rating, comment } = req.body;

    if (!patient_name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (comment.length < 10) {
      return res.status(400).json({ success: false, message: 'Comment must be at least 10 characters.' });
    }

    await pool.query(
      'INSERT INTO reviews (patient_name, patient_email, rating, comment) VALUES (?, ?, ?, ?)',
      [patient_name.trim(), patient_email || null, parseInt(rating), comment.trim()]
    );

    res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted for approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const approveReview = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE reviews SET is_approved = TRUE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review approved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllServices, getServiceById, updateService,
  getApprovedReviews, getAllReviews, submitReview, approveReview, deleteReview
};

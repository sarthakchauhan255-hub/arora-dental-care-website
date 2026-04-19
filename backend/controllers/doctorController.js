const { pool } = require('../config/database');

const getAllDoctors = async (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';
    let query = 'SELECT * FROM doctors';
    if (activeOnly) query += ' WHERE is_active = TRUE';
    query += ' ORDER BY id ASC';
    const [rows] = await pool.query(query);
    res.json({ success: true, doctors: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, doctor: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, specialty, bio, image_url, email, phone, experience_years } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ success: false, message: 'Name and specialty are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO doctors (name, specialty, bio, image_url, email, phone, experience_years) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, specialty, bio || null, image_url || null, email || null, phone || null, experience_years || 0]
    );
    res.status(201).json({ success: true, message: 'Doctor added.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, bio, image_url, email, phone, experience_years, is_active } = req.body;

    const [result] = await pool.query(
      'UPDATE doctors SET name=?, specialty=?, bio=?, image_url=?, email=?, phone=?, experience_years=?, is_active=? WHERE id=?',
      [name, specialty, bio, image_url, email, phone, experience_years, is_active !== undefined ? is_active : true, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE doctors SET is_active = FALSE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };

const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/email');

const WORKING_HOURS_START = 9; // 9 AM
const WORKING_HOURS_END = 18;  // 6 PM
const SLOT_DURATION = 60;      // minutes

// Generate time slots
const generateSlots = () => {
  const slots = [];
  for (let hour = WORKING_HOURS_START; hour < WORKING_HOURS_END; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00:00`);
    if (hour + 0.5 < WORKING_HOURS_END) {
      slots.push(`${String(hour).padStart(2, '0')}:30:00`);
    }
  }
  return slots;
};

// Get available slots for a date
const getAvailableSlots = async (req, res) => {
  try {
    const { date, doctor_id } = req.query;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates.' });
    }

    // No weekend bookings (Saturday=6, Sunday=0)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({ success: true, slots: [], message: 'We are closed on weekends.' });
    }

    const allSlots = generateSlots();

    let query = `SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status NOT IN ('cancelled')`;
    const params = [date];

    if (doctor_id) {
      query += ' AND doctor_id = ?';
      params.push(doctor_id);
    }

    const [bookedRows] = await pool.query(query, params);
    const bookedTimes = bookedRows.map(r => r.appointment_time);

    // If today, filter past slots
    const now = new Date();
    const availableSlots = allSlots.map(slot => {
      const isBooked = bookedTimes.includes(slot);
      let isPast = false;

      if (selectedDate.toDateString() === now.toDateString()) {
        const [h, m] = slot.split(':');
        const slotTime = new Date();
        slotTime.setHours(parseInt(h), parseInt(m), 0, 0);
        isPast = slotTime <= now;
      }

      return {
        time: slot,
        display: formatTime(slot),
        available: !isBooked && !isPast,
      };
    });

    res.json({ success: true, slots: availableSlots });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const formatTime = (time) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

// Book appointment
const bookAppointment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, message } = req.body;

    // Validate date
    const selectedDate = new Date(appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'We are closed on weekends.' });
    }

    // Validate working hours
    const [h] = appointment_time.split(':');
    const hour = parseInt(h);
    if (hour < WORKING_HOURS_START || hour >= WORKING_HOURS_END) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Appointment must be during working hours (9 AM - 6 PM).' });
    }

    // Lock check for race condition prevention
    const [existing] = await conn.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status NOT IN (\'cancelled\') FOR UPDATE',
      [doctor_id || null, appointment_date, appointment_time]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'This slot was just booked. Please choose another time.' });
    }

    const [result] = await conn.query(
      'INSERT INTO appointments (patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patient_name, patient_email, patient_phone, service_id || null, doctor_id || null, appointment_date, appointment_time, message || null]
    );

    await conn.commit();

    const appointmentId = result.insertId;

    // Get service name for email
    let serviceName = 'General Consultation';
    if (service_id) {
      const [svc] = await pool.query('SELECT name FROM services WHERE id = ?', [service_id]);
      if (svc.length > 0) serviceName = svc[0].name;
    }

    const appointmentData = { patient_name, patient_email, patient_phone, appointment_date, appointment_time, message };

    // Send emails non-blocking
    sendEmail(patient_email, emailTemplates.appointmentConfirmation(appointmentData, serviceName)).catch(console.error);
    if (process.env.ADMIN_EMAIL) {
      sendEmail(process.env.ADMIN_EMAIL, emailTemplates.adminNewBooking(appointmentData, serviceName)).catch(console.error);
    }

    await pool.query('UPDATE appointments SET confirmation_sent = TRUE WHERE id = ?', [appointmentId]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! A confirmation email has been sent.',
      appointmentId,
    });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This slot is already booked.' });
    }
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  } finally {
    conn.release();
  }
};

// Admin: Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const { status, sort = 'date_asc', date_from, date_to } = req.query;

    let query = `
      SELECT a.*, s.name as service_name, d.name as doctor_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (date_from) { query += ' AND a.appointment_date >= ?'; params.push(date_from); }
    if (date_to) { query += ' AND a.appointment_date <= ?'; params.push(date_to); }

    const sortMap = {
      date_asc: 'a.appointment_date ASC, a.appointment_time ASC',
      date_desc: 'a.appointment_date DESC, a.appointment_time DESC',
      name_asc: 'a.patient_name ASC',
      created_desc: 'a.created_at DESC',
    };
    query += ` ORDER BY ${sortMap[sort] || sortMap.date_asc}`;

    const [rows] = await pool.query(query, params);

    // Auto-mark missed appointments
    const now = new Date();
    for (const apt of rows) {
      if (apt.status === 'pending') {
        const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        if (aptDateTime < now) {
          await pool.query('UPDATE appointments SET status = ? WHERE id = ?', ['missed', apt.id]);
          apt.status = 'missed';
        }
      }
    }

    res.json({ success: true, appointments: rows, total: rows.length });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'missed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");
    const [confirmed] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'");
    const [completed] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'");
    const [today] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()");
    const [thisMonth] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE MONTH(appointment_date) = MONTH(CURDATE()) AND YEAR(appointment_date) = YEAR(CURDATE())");

    res.json({
      success: true,
      stats: {
        total: total[0].count,
        pending: pending[0].count,
        confirmed: confirmed[0].count,
        completed: completed[0].count,
        today: today[0].count,
        thisMonth: thisMonth[0].count,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAvailableSlots, bookAppointment, getAllAppointments, updateAppointmentStatus, getDashboardStats };

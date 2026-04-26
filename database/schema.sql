-- Aurora Dental Care - Database Schema
-- Run this file to initialize the database

CREATE DATABASE IF NOT EXISTS aurora_dental;
USE aurora_dental;

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  otp VARCHAR(6),
  otp_expires_at DATETIME,
  otp_attempts INT DEFAULT 0,
  last_otp_sent DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(150) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(20),
  experience_years INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(300),
  image_url VARCHAR(500),
  duration_minutes INT DEFAULT 60,
  price_range VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  service_id INT,
  doctor_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  message TEXT,
  status ENUM('pending', 'confirmed', 'completed', 'missed', 'cancelled') DEFAULT 'pending',
  confirmation_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  UNIQUE KEY unique_slot (doctor_id, appointment_date, appointment_time)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(255),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin (password: Admin@Aurora2024)
INSERT INTO admin (name, email, password) VALUES (
  'Dr. Admin',
  'admin@auroradental.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj3.pBwnzOQi'
) ON DUPLICATE KEY UPDATE id=id;

-- Seed doctors
INSERT INTO doctors (name, specialty, bio, experience_years, image_url) VALUES
('Dr. Sarah Mitchell', 'Implantologist & Oral Surgeon', 'Dr. Mitchell specializes in full-arch restoration and complex implant cases with over 15 years of experience. She completed her fellowship at Harvard School of Dental Medicine.', 15, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'),
('Dr. James Chen', 'Cosmetic & Restorative Dentist', 'Dr. Chen is an expert in smile makeovers and cosmetic dentistry, having transformed over 3000 smiles. He is certified by the American Academy of Cosmetic Dentistry.', 12, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'),
('Dr. Priya Sharma', 'Periodontist & Bone Specialist', 'Dr. Sharma has pioneered minimally invasive bone grafting techniques and is a sought-after speaker at international dental conferences.', 10, 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop')
ON DUPLICATE KEY UPDATE id=id;

-- Seed services
INSERT INTO services (name, slug, description, short_description, duration_minutes, price_range, display_order) VALUES
('Dental Implants', 'dental-implants', 'Our state-of-the-art dental implant procedure replaces missing teeth with titanium posts that fuse to your jawbone, providing a permanent, natural-looking solution. We use the latest 3D imaging technology for precise placement and maximum success rates.', 'Permanent tooth replacement with titanium implants for a natural look and feel.', 120, '$1,500 - $4,000', 1),
('Wisdom Teeth Removal', 'wisdom-teeth-removal', 'Safe and comfortable extraction of wisdom teeth under local or general anesthesia. Our experienced oral surgeons minimize discomfort and recovery time using advanced surgical techniques and sedation options.', 'Comfortable extraction with minimal recovery time using advanced techniques.', 90, '$300 - $800', 2),
('Teeth-in-a-Day', 'teeth-in-a-day', 'Revolutionary full-arch restoration in a single appointment. Walk in with failing teeth, walk out with a complete, beautiful new smile. This procedure uses 4-6 strategically placed implants to support a full arch of teeth.', 'Complete smile restoration in one single appointment.', 240, '$15,000 - $25,000', 3),
('Bone Grafting', 'bone-grafting', 'Advanced bone regeneration procedures to rebuild jawbone volume and density, preparing the site for future implants or simply preserving existing bone structure. We use biocompatible materials for optimal results.', 'Jawbone rebuilding to prepare for implants or preserve structure.', 90, '$500 - $2,500', 4)
ON DUPLICATE KEY UPDATE id=id;

-- Seed approved reviews
INSERT INTO reviews (patient_name, rating, comment, is_approved) VALUES
('Margaret Thompson', 5, 'Dr. Mitchell performed my full-arch implants and I cannot believe the transformation. I went from hiding my smile for 10 years to smiling in every photo. The team at Aurora Dental is truly world-class.', TRUE),
('Robert Kim', 5, 'Had my wisdom teeth removed here and was terrified. The team made me feel so comfortable and the procedure was painless. Recovery was quick too. Highly recommend Aurora Dental Care!', TRUE),
('Linda Vasquez', 5, 'The Teeth-in-a-Day procedure changed my life. I walked in with dentures and left with a permanent, beautiful smile in one day. Worth every penny. Dr. Chen is a true artist.', TRUE),
('David Okafor', 4, 'Professional, clean, and caring staff. My bone graft procedure went smoothly and I am now ready for my implants. Dr. Sharma explained everything thoroughly. Excellent experience overall.', TRUE)
ON DUPLICATE KEY UPDATE id=id;

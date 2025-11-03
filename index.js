// Import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db'); // PostgreSQL connection file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the patient form page
app.get('/patient-form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'patient-form.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const {
    full_name, age, gender, contact, city,
    symptoms, chronic_conditions, medications,
    consultation_type, preferred_date, preferred_time, notes
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO patients 
       (full_name, age, gender, contact, city, symptoms, chronic_conditions, medications,
        consultation_type, preferred_date, preferred_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [full_name, age, gender, contact, city, symptoms, chronic_conditions,
       medications, consultation_type, preferred_date, preferred_time, notes]
    );
    console.log('✅ New patient form saved successfully.');
    res.redirect('/success.html');
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).send('Error saving form.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 DoctorAtHome app running on port ${port}`);
});

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

// Admin route to view stored patient submissions
app.get('/admin/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    let html = `
      <h1 style="font-family: Arial; color: #0078d7;">Patient Submissions</h1>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th>ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>City</th>
          <th>Symptoms</th>
          <th>Consultation Type</th>
          <th>Created At</th>
        </tr>`;
    result.rows.forEach(p => {
      html += `<tr>
        <td>${p.id}</td>
        <td>${p.full_name}</td>
        <td>${p.contact}</td>
        <td>${p.city || ''}</td>
        <td>${p.symptoms || ''}</td>
        <td>${p.consultation_type || ''}</td>
        <td>${p.created_at}</td>
      </tr>`;
    });
    html += `</table>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching patient data.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 DoctorAtHome app running on port ${port}`);
});

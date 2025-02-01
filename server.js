const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let appointments = [];
let waitTime = 0; 

app.get('/api/wait-time', (req, res) => {
  res.json({ waitTime });
});

// API to update wait time
app.post('/api/wait-time', (req, res) => {
  const { newWaitTime } = req.body;
  if (typeof newWaitTime === 'number' && newWaitTime >= 0) {
    waitTime = newWaitTime;
    res.json({ message: 'Wait time updated successfully', waitTime });
  } else {
    res.status(400).json({ error: 'Invalid wait time value' });
  }
});

// API to get all appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// API to create a new appointment
app.post('/api/appointments', (req, res) => {
  const { patientName, time } = req.body;
  if (!patientName || !time) {
    return res.status(400).json({ error: 'Patient name and time are required' });
  }
  const newAppointment = { id: appointments.length + 1, patientName, time };
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

// API to delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  appointments = appointments.filter((appt) => appt.id !== parseInt(id));
  res.json({ message: 'Appointment deleted successfully' });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//in-memory data store
let appointments = [];
let waitTime = 0; //initial wait time 
let queue = []; //queue of patients who have arrived

//API to get current wait time
app.get('/api/wait-time', (req, res) => {
  res.json({ waitTime });
});

//API to update wait time
app.post('/api/wait-time', (req, res) => {
  const { newWaitTime } = req.body;
  if (typeof newWaitTime === 'number' && newWaitTime >= 0) {
    waitTime = newWaitTime;
    res.json({ message: 'Wait time updated successfully', waitTime });
  } else {
    res.status(400).json({ error: 'Invalid wait time value' });
  }
});

//API to get all appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

//API to create a new appointment
app.post('/api/appointments', (req, res) => {
  const { patientName, time } = req.body;

  if (!patientName || !time) {
    return res.status(400).json({ error: 'Patient name and time are required' });
  }

  const appointmentTime = new Date(time);
  const currentTime = new Date();

  //check if the appointment time is in the past
  if (appointmentTime < currentTime) {
    return res.status(400).json({ error: 'Appointment time cannot be in the past' });
  }

  //check if the appointment time is already taken
  const isTimeTaken = appointments.some((appt) => appt.time === time);
  if (isTimeTaken) {
    return res.status(400).json({ error: 'Appointment time is already taken' });
  }

  const newAppointment = { id: appointments.length + 1, patientName, time };
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

//API to delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  appointments = appointments.filter((appt) => appt.id !== parseInt(id));
  res.json({ message: 'Appointment deleted successfully' });
});

//API to modify an appointment
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { patientName, time } = req.body;

  if (!patientName || !time) {
    return res.status(400).json({ error: 'Patient name and time are required' });
  }

  const appointmentIndex = appointments.findIndex((appt) => appt.id === parseInt(id));

  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointments[appointmentIndex] = { ...appointments[appointmentIndex], patientName, time };
  res.json({ message: 'Appointment updated successfully', appointment: appointments[appointmentIndex] });
});

//API to notify patient arrival
app.post('/api/arrive', (req, res) => {
  const { patientName } = req.body;
  if (!patientName) {
    return res.status(400).json({ error: 'Patient name is required' });
  }
  queue.push(patientName);
  res.json({ message: 'Patient arrival acknowledged', position: queue.length });
});

//API to get queue position
app.get('/api/queue-position/:patientName', (req, res) => {
  const { patientName } = req.params;
  const position = queue.indexOf(patientName) + 1;
  if (position === 0) {
    return res.status(404).json({ error: 'Patient not found in queue' });
  }
  res.json({ position });
});

//API to manage queue (add/remove patients)
app.post('/api/manage-queue', (req, res) => {
  const { action, patientName } = req.body;
  if (!action || !patientName) {
    return res.status(400).json({ error: 'Action and patient name are required' });
  }
  if (action === 'add') {
    queue.push(patientName);
    res.json({ message: 'Patient added to queue', queue });
  } else if (action === 'remove') {
    queue = queue.filter((name) => name !== patientName);
    res.json({ message: 'Patient removed from queue', queue });
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

//Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
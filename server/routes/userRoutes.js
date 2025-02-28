// routes/userRoutes.js
const express = require('express');
const { 
  loginController, 
  registerController, 
  authController, 
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController, 
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabitityController,
  userAppointmentsController
} = require('../controllers/usersCtrl.js');
const authMiddleware = require('../middlerwares/authMiddleware.js');

const router = express.Router();

// Login || POST
router.post('/login', loginController);

// Register || POST
router.post('/register', registerController);

// Auth || POST
router.post('/getUserData', authMiddleware, authController);

// Apply Doctor || POST
router.post('/apply-doctor', authMiddleware, applyDoctorController);

// Notification || POST
router.post('/get-all-notification', authMiddleware, getAllNotificationController);

// Delete Notification || POST
router.post('/delete-all-notification', authMiddleware, deleteAllNotificationController);

// Get All Doctors || GET
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// Book Appointment || POST
router.post('/book-appointment', authMiddleware, bookAppointmentController);

// Booking Availability || POST
router.post('/booking-availabitity', authMiddleware, bookingAvailabitityController);

// Appointment list 
router.get('/user-appointments', authMiddleware, userAppointmentsController);

module.exports = router;

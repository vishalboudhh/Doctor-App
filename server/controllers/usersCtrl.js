// controllers/usersCtrl.js
const userModel = require('../models/userModels.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModel.js');
const appointmentModel = require('../models/appointmentModel.js');
const moment = require('moment');

// Register Controller
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: 'User already exists', success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registration successfully completed", success: true });
  } catch (error) {
    console.log(`Error in register controller: ${error}`);
    res.status(500).send({ success: false, message: `Register controller ${error.message}` });
  }
};

// Login Controller
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: 'Invalid email or password', success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).send({ message: 'Login successfully', success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in loginController ${error.message}` });
  }
};

// Auth Controller
const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    if (user) user.password = undefined;
    if (!user) {
      return res.status(200).send({ message: 'User not found', success: false });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Auth error', success: false, error });
  }
};

// Apply Doctor Controller
const applyDoctorController = async (req, res) => {
  try {
    // Set status to "panding" (or use "pending" if you prefer)
    const newDoctor = new doctorModel({ ...req.body, status: 'panding' });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: 'apply-doctor-request',
      message: `${newDoctor.firstName} ${newDoctor.lastName} applied for doctor`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: '/admin/doctors'
      }
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({ success: true, message: 'Doctor application successfully submitted' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: 'Error while applying for doctor' });
  }
};

// Get All Notification Controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = seennotification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: 'All notifications marked as seen',
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error in getAllNotificationController', success: false, error });
  }
};

// Delete All Notification Controller
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: 'All notifications deleted successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in deleteAllNotificationController',
      error
    });
  }
};

// Get All Doctors Controller
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: 'approved' });
    res.status(200).send({
      success: true,
      message: 'Doctors list fetched successfully',
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error while fetching doctors'
    });
  }
};

// Book Appointment Controller
const bookAppointmentController = async (req, res) => {
  try {
    // Convert date/time using moment
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = 'panding';
    // Expect doctorInfo and userInfo to be objects
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    // Notify the doctor (assuming doctorInfo contains userId of the doctor)
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: 'New-appointment-request',
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments"
    });
    await user.save();
    res.status(200).send({ success: true, message: 'Appointment booked successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while booking appointment" });
  }
};

// Booking Availability Controller
const bookingAvailabitityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, 'HH:mm').subtract(1, 'hours').toISOString();
    const toTime = moment(req.body.time, 'HH:mm').add(1, 'hours').toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      }
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: 'Appointment is not available',
        success: true
      });
    } else {
      return res.status(200).send({
        success: true,
        message: 'Appointment available'
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in Booking"
    });
  }
};

// User Appointments Controller
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: 'User appointments fetched successfully',
      data: appointments
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in user appointments'
    });
  }
};

module.exports = {
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
};

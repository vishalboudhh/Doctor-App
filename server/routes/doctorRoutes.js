const express = require("express");
const authMiddleware = require("../middlerwares/authMiddleware.js");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl.js");

const router = express.Router();

// Get single doctor info
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

// Update doctor profile
router.post("/updateProfile", authMiddleware, updateProfileController);

// Get single doctor by id
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);

// Get doctor appointments
router.get("/doctor-appointments", authMiddleware, doctorAppointmentsController);

// Update appointment status
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;

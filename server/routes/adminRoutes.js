// server/routes/adminRoutes.js
const express = require('express');
const authMiddleware = require('../middlerwares/authMiddleware');
const { getAllUsersControllers, getAllDoctorsControllers, changeAccountStatusController } = require('../controllers/adminCtrl');
const router = express.Router();
// GET /api/v1/admin/getAllUsers - Protected route to fetch all users
router.get('/getAllUsers', authMiddleware, getAllUsersControllers);
// GET /api/v1/admin/getAllDoctors - Protected route to fetch all doctors
router.get('/getAllDoctors', authMiddleware, getAllDoctorsControllers);
//post account status
router.post('/changeAccountStatus',authMiddleware,changeAccountStatusController)
module.exports = router;

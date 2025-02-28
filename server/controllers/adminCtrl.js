// server/controllers/adminCtrl.js
const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');

const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      message: 'All users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching users',
      error,
    });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      message: 'All doctors fetched successfully',
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching doctors',
      error,
    });
  }
};

//account status
const changeAccountStatusController = async(req,res) =>{
  try {
    const {doctorId,status} = req.body
    const doctor = await doctorModel.findByIdAndUpdate(doctorId,{status})
    const user = await userModel.findOne({_id:doctor.userId})
    const notification = user.notification
    notification.push({
      type:'doctor-account-request-updated',
      message:`Your doctor account status has been updated to ${status}`,
      onClickPath:'/notification'
    })

    user.isDoctor = status === 'approved' ? true : false
    await user.save()
    res.status(201).send({
      success:true,
      message:"Doctor Account status updated",
      data:doctor
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:'Error in account status',
      error
    })
    
  }
}

module.exports = { getAllUsersControllers, getAllDoctorsControllers,changeAccountStatusController };

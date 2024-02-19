const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const moment = require("moment");

router.post("/register", async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email })
        if (userExists) {
            return res
            .status(200)
            .send({ message: "User already exists", success: false });
        }

        const password = req.body.password;
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        req.body.password = hashedPassword;
        const newUser = new User(req.body);

        await newUser.save()
        res
        .status(200)
        .send({ message: "User created successfully", success: true });
    } catch (error) {
        console.log("error", error)
        res
        .status(500)
        .send({ message: "Error creating user", success: false , error });
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res
            .status(200)
            .send({ message: "User does not exist", success: false });
        }

        const isMatch = await bcryptjs.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(200)
            .send({ message: "Password is incorrect", success: false });
        } else {
            const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, {
                expiresIn: "1d"
            })
            res.status(200)
            .send({ message: "Login Successful", success: true, data:token });
        }
    } catch (error) {
        console.log("error", error)
        res.status(500)
        .send({ message: "Error logging in", success: false , error });
    }
});

router.post("/get-user-info-by-id", authMiddleware,  async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        user.password = undefined
        if (!user) {
            return res
            .status(200)
            .send({ message: "User does not exist", success: false });
        } else {
            res.status(200).send({  
                success: true, 
                data: user 
            });
        }
    } catch (error) {
        res
        .status(500)
        .send({ message: "Error getting user info", success: false , error });
    }
});

router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
    try {
      const newDoctor = new Doctor({ ...req.body, status: "pending" });
      await newDoctor.save();
      const adminUser = await User.findOne({ isAdmin: true });
  
      const unseenNotification = adminUser.unseenNotification;
      unseenNotification.push({
        type: "new-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.firstName + " " + newDoctor.lastName,
        },
        onClickPath: "/admin/doctorsList",
      });
      await User.findByIdAndUpdate(adminUser._id, { unseenNotification });
      res.status(200).send({
        success: true,
        message: "Doctor account applied successfully",
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
});

router.post("/mark-all-notifications-as-seen", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        const unseenNotification = user.unseenNotification;
        const seenNotification = user.seenNotification;
        seenNotification.push(...unseenNotification);
        user.unseenNotification = [];
        user.seenNotification = seenNotification;
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).send({
          success: true,
          message: "All notifications marked as seen",
          data: updatedUser,
        });
      } catch (error) {
        console.log("error", error);
        res.status(500).send({
          message: "Error applying doctor account",
          success: false,
          error,
        });
      }
});

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      user.seenNotification = [];
      user.unseenNotification = [];
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications cleared",
        data: updatedUser,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
});

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
  try {
      const doctors = await Doctor.find({ status: "approved"});
      res
      .status(200)
      .send({ message: "Doctors fetched successfully", success: true, data: doctors });
  } catch (error) {
      console.log("error", error)
      res
      .status(500)
      .send({ message: "Error applying doctor account", success: false , error });
  }
});

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
      req.body.status = "pending";
      req.body.date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
      req.body.time = moment(req.body.time, 'HH:mm').toISOString();
      const newAppointment = new Appointment(req.body);
      await newAppointment.save();

      //pushing notifications to doctor base on userId

      const user = await User.findOne({_id: req.body.doctorInfo.userId});
      user.unseenNotification.push({
        type: "new-appointment-request",
        message: `A new appointment request has been made by ${req.body.userInfo.name}`,
        onClickPath: "/doctor/appointment"
      });
      await user.save();
      res
      .status(200)
      .send({ message: "Appointment booked successfully", success: true  });
  } catch (error) {
      console.log("error", error)
      res
      .status(500)
      .send({ message: "Error booking appointment", success: false , error });
  }
});

router.post("/check-booking-availability", authMiddleware, async (req, res) => {
  try {
      const date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
      const fromTime = moment(req.body.time, 'HH:mm').subtract(1, 'hours').toISOString();
      const toTime = moment(req.body.time, 'HH:mm').add(1, 'hours').toISOString();

      const doctorId = req.body.doctorId;
      const appointments = await Appointment.find({
        doctorId,
        date,
        time: { $gte: fromTime, $lte: toTime},
        // status: "approved"
      });

      if (appointments.length > 0) {
        return res
        .status(200)
        .send({ message: "Appointments not available", success: false  });
      } else {
        return res
        .status(200)
        .send({ message: "Appointments available", success: true  });
      }


  } catch (error) {
      console.log("error", error)
      res
      .status(500)
      .send({ message: "Error booking appointment", success: false , error });
  }
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log("error", error)
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });
  }
});

module.exports = router;


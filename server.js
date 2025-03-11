const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

//includes
const addadmin = require("./user/addingadmin");
//admmin
const loginRoutes = require("./auth/login");
const studentexpo = require("./auth/studenlogin");
const addcoordinator = require("./routes/admin/usermanagement/addcoordinator");
const programname = require("./routes/admin/usermanagement/getprogramname");
const coordinator = require("./routes/admin/usermanagement/coordinator");
const updatecoordinator = require("./routes/admin/usermanagement/updatecoordinator");
const getstudenst = require("./routes/admin/usermanagement/getstudents");
const addprogram = require("./routes/admin/program/addprogram");
const updateprogram = require("./routes/admin/program/editprogram");
const getprogram = require("./routes/admin/program/getprogram");
const addsy = require("./routes/admin/schoolyear/addsy");
//admin dashboard
const allcompany = require("./routes/admin/dashboard/countallcompanies");
const allcoordinator = require("./routes/admin/dashboard/countcoordinator");
const allstudent = require("./routes/admin/dashboard/totalstudents");
const recentcoordinator = require("./routes/admin/dashboard/recentcoordinator");
const allprog = require("./routes/admin/dashboard/countprograms");
//coordinator
const addcompany = require("./routes/coordinator/company/addcompany");
const getcompany = require("./routes/coordinator/company/getcompany");
const getcompanyname = require("./routes/coordinator/company/updatecompany");
const addstudent = require("./routes/coordinator/students/addstudent");
const updatestudent = require("./routes/coordinator/students/updatestudent");
const companyname = require("./routes/coordinator/students/getcompanyname");
const veiwstudents = require("./routes/coordinator/students/getstudent");
const annouce = require("./routes/coordinator/announcements/announcement");
const annoucement = require("./routes/coordinator/announcements/veiwannoucement");
const studentreport = require("./routes/coordinator/reports/studentreport");
const timesheet = require("./routes/coordinator/attendance/timesheet");
//coordinator dashboard
const coordinatorcom = require("./routes/coordinator/dashboard/coordinatorcompany");
const coordinatorstudent = require("./routes/coordinator/dashboard/coordinatorstudent");
const recentlyaddstudent = require("./routes/coordinator/dashboard/recentlyaddedstudent");
const wcmessage = require("./routes/coordinator/dashboard/welcomecoordinator");
const cdchart = require("./routes/coordinator/dashboard/cdchart");

// student
const studentprofile = require("./routes/student/profile/studentdetails");
const latestannouncement = require("./routes/student/dashboard/latesannouncement");
const homeds = require("./routes/student/dashboard/hometime");
const updatecompany = require("./routes/coordinator/company/updatecompany");
const dailytime = require("./routes/student/time/timerecord");
const timedtr = require("./routes/student/dtr/timedtr");
const changepass = require("./routes/student/changepass/changepass");
const upload = require("./routes/student/fileupload/cloudinaryupload");

// Routes
app.use("/api/add-admin", addadmin(db));
//Admin API's
app.use("/login", loginRoutes(db));
app.use("/api/student/login", studentexpo(db));
app.use("/api/add-coordinator", addcoordinator(db));
app.use("/api/programname", programname(db));
app.use("/api/coordinators", coordinator(db));
app.use("/api/update-coordinator", updatecoordinator(db));
app.use("/api/studentsall", getstudenst(db));
app.use("/api/add-program", addprogram(db));
app.use("/api/programs", updateprogram(db));
app.use("/api/programs", getprogram(db));
app.use("/api/add-schoolyear", addsy(db));
app.use("/countall-companies", allcompany(db));
app.use("/api/count-coordinators", allcoordinator(db));
app.use("/countall-students", allstudent(db));
app.use("/api/recent-coordinators", recentcoordinator(db));
app.use("/api/count-programs", allprog(db));

//Coordinator side API's
app.use("/api/add-company", addcompany(db));
app.use("/api/companiesni", getcompany(db));
app.use("/api/companynameni", companyname(db));
app.use("/api/company", updatecompany(db));
app.use("/api/add-student", addstudent(db));
app.use("/api/students", updatestudent(db));
app.use("/api/studentsni", veiwstudents(db));
app.use("/api/announcements", annouce(db));
app.use("/api/announcementsni", annoucement(db));
app.use("/api/timesheet", timesheet(db));
app.use("/api/count-companies", coordinatorcom(db));
app.use("/api/count-students", coordinatorstudent(db));
app.use("/api/recent-students", recentlyaddstudent(db));
app.use("/api/reportstudent", studentreport(db));
app.use("/api/coordinatorwc", wcmessage(db));
app.use("/api/top-companies", cdchart(db));

//student side API's
app.use("/api/student-timesheets", timedtr(db));
app.use("/student/time", dailytime(db));
app.use("/api/student-details", studentprofile(db));
app.use("/api/latest-announcement", latestannouncement(db));
app.use("/api/student-homedetails", homeds(db));
app.use("/api/studentchangepass", changepass(db));
app.use("/documents", upload(db));

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Express MySQL Backend!");
});
app.get("/api/check-email", async (req, res) => {
  const { email } = req.query;

  try {
    const coordinator = await Coordinator.findOne({
      where: { coordinator_email: email },
    });
    res.json({ exists: !!coordinator });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Failed to check email availability." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

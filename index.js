// dotenv
require("dotenv").config();
require("express-group-routes");
//instantiate express module
const express = require("express");
//init bodyParser
const bodyParser = require("body-parser");
//use express in app variable
const app = express();
const multer = require("multer");
const path = require("path");
//define the server port
const port = 3000;

//allow this app to receive incoming json request
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.fieldname);
  }
});

const upload = multer({
  limits: { fieldSize: 4 * 1024 * 1024 },
  storage
});

//controllers
const AuthController = require("./controllers/auth");
const RoomsController = require("./controllers/rooms");

//middlewares
const { authenticated, authorized } = require("./middleware");

//create the homepage route
app.group("/api/v2", router => {
  // Auth API
  router.post("/login", AuthController.login);

  // Rooms API
  router.get(
    "/rooms",
    authenticated,
    // authorized,
    RoomsController.getRooms
  ); // Get Room
  router.post(
    "/rooms",
    authenticated,
    // authorized,
    RoomsController.postRooms
  ); // Post Room
  router.put(
    "/room/:room_id",
    authenticated,
    // authorized,
    RoomsController.putRooms
  ); // Update Room
  router.get(
    "/customers",
    authenticated,
    // authorized,
    RoomsController.getCustomers
  ); // Get Customer
  router.post(
    "/customers",
    authenticated,
    // authorized,
    RoomsController.postCustomers
  ); // Post Customer
  router.put(
    "/customers/:customer_id",
    authenticated,
    // authorized,
    RoomsController.putCustomers
  ); // Update Customer
  router.get(
    "/checkin",
    authenticated,
    // authorized,
    RoomsController.getCheckinRoom
  ); // Get Checkin
  router.post(
    "/checkin",
    authenticated,
    // authorized,
    RoomsController.postCheckin
  ); // Post Checkin
  router.put(
    "/order/:order_id",
    authenticated,
    // authorized,
    RoomsController.putOrders
  ); // Update Orders
  router.get(
    "/profile/:user_id",
    authenticated,
    authorized,
    RoomsController.getProfile
  );
  router.put(
    "/profile/:user_id",
    authenticated,
    authorized,
    upload.single("avatar"),
    RoomsController.putProfile
  );
});

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "You are not authorized." });
  } else {
    next(err);
  }
});

//when this nodejs app executed, it will listen to defined port
app.listen(port, () => console.log(`Listening on port ${port}!`));

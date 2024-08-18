const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/api/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/welcome", (req, res, next) => {
  res.status(200).json({ message: "welcome to our api !!!!" });
});
app.use("/api/feed", feedRoutes);
app.use("/api/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const message = error.message;
  const status = error.statusCode || 500;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    const server = app.listen(port);
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      console.log("client connected");
    });
  })
  .catch((err) => console.log(err));

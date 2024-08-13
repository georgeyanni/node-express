const express = require("express");
const { body } = require("express-validator");
const authcontroller = require("../controllers/auth");
const User = require("../model/user");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("email is not valid")
      .custom((val, { req }) => {
        if (val === req.body.email) {
          return User.findOne({ email: val }).then((userDoc) => {
            if (userDoc) return Promise.reject("Email address already exist");
          });
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authcontroller.signUp
);
router.post("/login", authcontroller.login);
module.exports = router;

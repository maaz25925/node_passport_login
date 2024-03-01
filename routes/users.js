const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !confirm_password) {
    errors.push({ message: "Please input all fields" });
  }

  // Check passwords match
  if (password !== confirm_password) {
    errors.push({ message: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      confirm_password,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ message: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          confirm_password,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_message",
                  "Registration complete. Please log in to your account."
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.error(err));
          });
        });
      }
    });
  }
});

module.exports = router;

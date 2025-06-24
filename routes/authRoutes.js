const express = require("express");
const { userRegister, loginUser, adminLogin } = require("../controllers/authController");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/admin-login", adminLogin);

module.exports = router;
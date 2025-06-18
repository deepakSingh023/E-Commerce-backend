const express = require("express");
const { userRegister, loginUser } = require("../controllers/authController");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/admin-login", loginUser);

module.exports = router;
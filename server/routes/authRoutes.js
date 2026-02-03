const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/profile').post(protect, updateUserProfile);

module.exports = router;

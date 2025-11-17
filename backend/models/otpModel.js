const mongoose = require('mongoose');  

const OTPModel = new mongoose.Schema(
    {
        otp: { type: String, required: true },
        email: { type: String, required: true },
        expiresAt: { type: Date, default: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes 
    }
)

const OTP = mongoose.model('OTP', OTPModel);

module.exports = OTP;
// backend/ultils/sendMail.js

const nodemailer = require('nodemailer');

/**
 * @desc Hàm gửi email sử dụng Nodemailer và cấu hình Gmail.
 * @param {object} data - Chứa { email: 'nguoi_nhan@mail.com', subject: 'Tieu de', html: 'Noi dung HTML' }
 * @returns {object} Thông tin gửi mail (info)
 * @throws {Error} Nếu gửi mail thất bại
 */
const sendMail = async (data) => {
    // 1. Cấu hình Transporter
    // Service 'gmail' tự động cấu hình host và port phù hợp.
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Lấy từ .env
            pass: process.env.EMAIL_PASS, // PHẢI LÀ MẬT KHẨU ỨNG DỤNG 16 KÝ TỰ TỪ GOOGLE
        },
        // [TÙY CHỌN] Bổ sung dòng sau nếu bạn vẫn gặp lỗi xác thực 
        // và đã chắc chắn về App Password (thường không cần thiết cho Gmail):
        // secure: true, 
        // port: 465,
    });

    // 2. Định nghĩa nội dung email
    let mailOptions = {
        from: process.env.EMAIL_USER,                 // Địa chỉ gửi đi (phải khớp với EMAIL_USER)
        to: data.email,                               // Địa chỉ nhận
        subject: data.subject || 'Thông báo từ Edupress', // Tiêu đề
        html: data.html,                              // Nội dung HTML
    };

    try {
        // 3. Gửi email
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        // Lỗi 535-5.7.8 sẽ được in ra ở đây
        console.error("Lỗi Nodemailer khi gửi email:", error);
        // Ném lỗi để Auth Controller có thể bắt và xử lý
        throw new Error(`Không thể gửi email: ${error.message}`); 
    }
};

// Export hàm sendMail
module.exports = sendMail;
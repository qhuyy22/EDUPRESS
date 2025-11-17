import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import Message from '../components/Message';
import Loader from '../components/Loader';
import './OtpPage.css';

const OtpPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.verifyOtp({ email, otp });
            navigate('/reset-password', { state: { email, otp } });
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-page">
            <div className="otp-card">
                <div className="otp-icon">🔐</div>
                <h2>Xác thực OTP</h2>
                <p className="otp-description">
                    Một mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã đó vào bên dưới.
                </p>
                {error && <Message variant="danger">{error}</Message>}
                {loading && <Loader />}
                <form onSubmit={handleSubmit} className="otp-form">
                    <div className="form-group">
                        <label>Mã OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="otp-input"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        Xác nhận
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OtpPage;

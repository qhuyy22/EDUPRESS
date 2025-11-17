import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Message from '../components/Message';
import Loader from '../components/Loader';
import './ForgotPasswordPage.css';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await authService.forgotPassword({ email });
            setSuccess(data.message);
            // Chờ một chút để người dùng đọc thông báo thành công
            setTimeout(() => {
                navigate('/otp', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-card">
                <div className="icon">🔐</div>
                <h2>Quên mật khẩu?</h2>
                <p className="subtitle">
                    Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn một mã OTP để đặt lại mật khẩu.
                </p>
                {error && <Message variant="danger">{error}</Message>}
                {success && <Message variant="success">{success}</Message>}
                {loading && <Loader />}
                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <label htmlFor="email">Địa chỉ Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        Gửi yêu cầu
                    </button>
                </form>
                <div className="help-text">
                    <p>
                        <Link to="/login">Quay lại trang đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

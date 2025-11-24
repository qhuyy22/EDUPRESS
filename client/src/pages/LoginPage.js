/**
 * LoginPage Component
 * User login form
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);

      if (result.success) {
        // Redirect based on user role
        if (result.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.data.role === 'provider') {
          navigate('/provider/courses');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">Đăng nhập</h2>

          {error && <Message type="error" message={error} />}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập email của bạn"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu của bạn"
                className="form-input"
                minLength="6"
              />
              <div className="forgot-password-link">
                <Link to="/forgot-password">Quên Mật khẩu?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? <Loader size="small" /> : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-link">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
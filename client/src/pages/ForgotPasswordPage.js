/**
 * ForgotPasswordPage Component
 * Request password reset (simplified version - contact admin)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="forgot-card">
            <div className="success-icon">✅</div>
            <h2>Request Submitted</h2>
            <Message type="info">
              <p>
                Your password reset request has been received for <strong>{email}</strong>.
              </p>
              <p>
                Please contact our admin team at <strong>admin@edupress.com</strong> with your
                registered email to reset your password.
              </p>
              <p>
                Our team will verify your identity and help you regain access to your account
                within 24 hours.
              </p>
            </Message>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-card">
          <div className="icon">🔐</div>
          <h2>Forgot Password?</h2>
          <p className="subtitle">
            Don't worry! Enter your email and we'll help you reset your password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Submit Request
            </button>
          </form>

          <div className="help-text">
            <p>
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
            <p className="note">
              Note: Password reset requires admin verification for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

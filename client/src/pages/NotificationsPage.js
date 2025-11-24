/**
 * NotificationsPage Component
 * Display user notifications with filtering and actions
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
      const response = await notificationService.getMyNotifications(params);

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải thông báo thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError('');
      setSuccess('');
      await notificationService.markAsRead(notificationId);
      setSuccess('Thông báo đã được đánh dấu là đã đọc.');
      fetchNotifications(); // Re-fetch to update list and count
    } catch (err) {
      setError(err.response?.data?.message || 'Đánh dấu đã đọc thất bại');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setError('');
      setSuccess('');
      await notificationService.markAllAsRead();
      setSuccess('Tất cả thông báo đã được đánh dấu là đã đọc.');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Đánh dấu tất cả đã đọc thất bại');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await notificationService.deleteNotification(notificationId);
      setSuccess('Thông báo đã được xóa thành công.');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa thông báo thất bại');
    }
  };

  return (
    <div className="notifications-page container">
      <header className="page-header">
        <h1>Thông báo của Bạn</h1>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              className="btn-mark-all"
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>
      </header>

      {success && <Message type="success" message={success} />}
      {error && <Message type="error" message={error} />}

      <div className="filter-controls">
        <label htmlFor="filter">Hiển thị:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả</option>
          <option value="unread">Chưa đọc ({unreadCount})</option>
        </select>
      </div>

      <div className="notifications-list">
        {loading ? (
          <Loader message="Đang tải thông báo..." />
        ) : notifications.length === 0 ? (
          <Message type="info" message="Bạn không có thông báo nào." />
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${
                !notification.read ? 'unread' : 'read'
              }`}
            >
              <div className="notification-icon">
                {/* Simple icon logic based on type (assuming a 'type' field exists or title hints it) */}
                {notification.title.includes('New Review') ? '⭐' : '🔔'}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>

                {notification.relatedCourse && (
                  <div className="related-course">
                    📚 Khóa học: {notification.relatedCourse.title}
                  </div>
                )}

                <div className="notification-meta">
                  <span className="timestamp">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {notification.link && (
                  <Link to={notification.link} className="btn-goto">
                    Đi tới
                  </Link>
                )}

                {!notification.read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(notification._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
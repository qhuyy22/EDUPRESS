/**
 * CourseManagementPage Component
 * Admin page to manage all courses - view, search, filter, approve/reject
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseManagementPage.css';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending, rejected
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Available categories (same as CreateCoursePage)
  const categories = [
    'Programming',
    'Business',
    'Design',
    'Marketing',
    'Photography',
    'Music',
    'Language',
    'Health & Fitness',
    'Other'
  ];

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await api.get('/admin/courses', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, category: categoryFilter, search: searchTerm }
      });

      // Backend returns { success, count, data } - we need the data array
      setCourses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải danh sách khóa học thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/admin/courses/${courseId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Khóa học đã được duyệt thành công!');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Duyệt khóa học thất bại');
    }
  };

  const handleReject = async (courseId) => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/admin/courses/${courseId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Khóa học đã bị từ chối thành công!');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Từ chối khóa học thất bại');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        setError('');
        setSuccess('');
        await api.delete(`/admin/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Khóa học đã được xóa thành công!');
        fetchCourses();
      } catch (err) {
        setError(err.response?.data?.message || 'Xóa khóa học thất bại');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Đang chờ';
      case 'rejected':
        return 'Bị từ chối';
      case 'draft':
        return 'Nháp';
      default:
        return 'Không xác định';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      case 'draft':
        return 'status-draft';
      default:
        return '';
    }
  };

  return (
    <div className="course-management-page container">
      <header className="page-header">
        <h1>Quản lý Khóa học</h1>
      </header>

      {success && <Message type="success" message={success} />}
      {error && <Message type="error" message={error} />}

      <div className="controls">
        <div className="search-filter-group">
          <form onSubmit={(e) => { e.preventDefault(); fetchCourses(); }} className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Tìm kiếm
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Đang chờ</option>
            <option value="rejected">Bị từ chối</option>
            <option value="draft">Nháp (Provider)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả Danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="course-list">
        {loading ? (
          <Loader message="Đang tải danh sách khóa học..." />
        ) : courses.length === 0 ? (
          <Message type="info" message="Không tìm thấy khóa học nào." />
        ) : (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              <img src={course.thumbnailUrl} alt={course.title} className="course-thumbnail" />
              <div className="course-info">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-meta">
                  <span className="meta-category">{course.category}</span>
                  <span className={`meta-status ${getStatusClass(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                  <span className="meta-price">
                    {course.price === 0 ? 'Miễn phí' : `$${course.price}`}
                  </span>
                </p>
                <div className="course-stats">
                  <span className="stat-item">
                    Học viên: {course.enrollmentCount || 0}
                  </span>
                  <span className="stat-item">
                    Đánh giá: {course.totalReviews || 0}
                  </span>
                  <span className="stat-item">
                    Xếp hạng: ⭐{course.averageRating?.toFixed(1) || 'N/A'}
                  </span>
                </div>

                <div className="action-buttons">
                  <Link to={`/course/${course._id}`} className="btn-view" target="_blank">
                    Xem
                  </Link>

                  {course.status === 'pending' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(course._id)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(course._id)}
                      >
                        Từ chối
                      </button>
                    </>
                  )}

                  {course.status === 'rejected' && (
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(course._id)}
                    >
                      Duyệt
                    </button>
                  )}

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(course._id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseManagementPage;
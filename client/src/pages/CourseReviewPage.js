/**
 * CourseReviewPage Component
 * Form for writing or editing a course review
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';
import courseService from '../services/courseService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseReviewPage.css';

const CourseReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch course details
      const courseResponse = await courseService.getCourseById(id);
      setCourse(courseResponse.data);

      // Fetch existing review if any
      try {
        const reviewResponse = await reviewService.getMyReview(id);
        if (reviewResponse.data) {
          setExistingReview(reviewResponse.data);
          setRating(reviewResponse.data.rating);
          setComment(reviewResponse.data.comment);
        }
      } catch (e) {
        // No existing review is not an error, just continue
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Tải dữ liệu khóa học hoặc đánh giá thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const reviewData = { rating, comment };

      if (existingReview) {
        await reviewService.updateReview(existingReview._id, reviewData);
        setSuccessMessage('Đánh giá đã được cập nhật thành công!');
      } else {
        await reviewService.submitReview(id, reviewData);
        setSuccessMessage('Đánh giá đã được gửi thành công!');
      }

      setTimeout(() => navigate(`/courses/${id}`), 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        (existingReview ? 'Cập nhật đánh giá thất bại' : 'Gửi đánh giá thất bại')
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await reviewService.deleteReview(existingReview._id);
      setSuccessMessage('Đánh giá đã được xóa thành công!');
      setTimeout(() => navigate(`/courses/${id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Đang tải dữ liệu đánh giá..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  const pageTitle = existingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá';

  return (
    <div className="course-review-page">
      <div className="container">
        <div className="review-form-container">
          <header className="review-header">
            <h1>{pageTitle}</h1>
            {course && (
              <h2 className="course-title">
                Khóa học: <span className="course-name">{course.title}</span>
              </h2>
            )}
          </header>

          <div className="review-form-body">
            {successMessage && <Message type="success" message={successMessage} />}
            {error && <Message type="error" message={error} />}

            <form onSubmit={handleSubmit}>
              {/* Rating Section */}
              <div className="form-group rating-group">
                <label>Xếp hạng</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment Section */}
              <div className="form-group">
                <label htmlFor="comment">Bình luận</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="6"
                  required
                  maxLength="500"
                  placeholder="Chia sẻ suy nghĩ của bạn về khóa học..."
                />
                <span className="char-count">
                  {comment.length}/500 ký tự
                </span>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(`/courses/${id}`)}
                  disabled={submitting}
                >
                  Hủy
                </button>

                {existingReview && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    Xóa đánh giá
                  </button>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Đang gửi...'
                    : existingReview
                    ? 'Cập nhật đánh giá'
                    : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewPage;
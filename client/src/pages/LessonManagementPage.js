/**
 * LessonManagementPage Component
 * Manage lessons for a course (Provider only)
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import lessonService from '../services/lessonService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './LessonManagementPage.css';

const LessonManagementPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for adding/editing lesson
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [courseRes, lessonsRes] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getCourseLessons(courseId),
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Tải dữ liệu khóa học và bài học thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      content: '',
    });
    setShowForm(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      content: lesson.content || '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingLesson) {
        // Update lesson
        await lessonService.updateLesson(courseId, editingLesson._id, formData);
        setSuccessMessage('Bài học đã được cập nhật thành công!');
      } else {
        // Create new lesson
        await lessonService.createLesson(courseId, formData);
        setSuccessMessage('Bài học đã được tạo thành công!');
      }

      await fetchData(); // Reload data
      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingLesson ? 'Cập nhật bài học thất bại' : 'Tạo bài học thất bại')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await lessonService.deleteLesson(courseId, lessonId);
      setSuccessMessage('Bài học đã được xóa thành công!');
      await fetchData(); // Reload data
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa bài học thất bại');
    }
  };

  if (loading) {
    return <Loader message="Đang tải dữ liệu..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="lesson-management-page container">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/my-courses')}>
          ← Quay lại Khóa học
        </button>
        <h1>
          Quản lý Bài học cho: <span className="course-title-header">{course?.title}</span>
        </h1>
        <button onClick={handleShowForm} className="btn-add-lesson">
          Thêm Bài học
        </button>
      </header>

      {successMessage && <Message type="success" message={successMessage} />}
      {error && <Message type="error" message={error} />}

      {/* Lesson Form (Add/Edit) */}
      {showForm && (
        <div className="lesson-form-container">
          <h2>{editingLesson ? 'Chỉnh sửa Bài học' : 'Tạo Bài học Mới'}</h2>
          <form onSubmit={handleFormSubmit} className="lesson-form">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                placeholder="Tiêu đề bài học"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả (Ngắn)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="2"
                placeholder="Mô tả ngắn gọn về bài học"
              />
            </div>

            <div className="form-group">
              <label htmlFor="videoUrl">URL Video (Youtube/Vimeo...)</label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleFormChange}
                placeholder="https://youtu.be/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Thời lượng (phút)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Nội dung Văn bản/Tài liệu</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                rows="6"
                placeholder="Nội dung bài học hoặc tài liệu kèm theo"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? 'Đang lưu...'
                  : editingLesson
                  ? 'Cập nhật Bài học'
                  : 'Thêm Bài học'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lessons List */}
      <div className="lessons-section">
        <h2>Danh sách Bài học</h2>
        <div className="lessons-container">
          {lessons.length === 0 ? (
            <div className="no-lessons">
              <p>Chưa có bài học nào. Nhấn "Thêm Bài học" để tạo bài học đầu tiên của bạn.</p>
            </div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="lesson-card">
                  <div className="lesson-number">Bài {index + 1}</div>
                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    <p className="lesson-meta">
                      {lesson.duration} phút
                      {lesson.videoUrl && ' • Có video'}
                    </p>
                    {lesson.description && (
                      <p className="lesson-desc">{lesson.description}</p>
                    )}
                  </div>
                  <div className="lesson-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditLesson(lesson)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteLesson(lesson._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonManagementPage;
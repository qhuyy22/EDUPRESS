/**
 * CreateCoursePage Component
 * Form for providers to create or edit courses
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CreateCoursePage.css';

const CreateCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Programming',
    thumbnailUrl: '',
    status: 'Draft', // Added status for editing
  });

  const [loading, setLoading] = useState(false);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Health & Fitness',
    'Language',
    'Other',
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    try {
      setFetchingCourse(true);
      const response = await courseService.getCourseById(id);
      const course = response.data;

      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        thumbnailUrl: course.thumbnailUrl || '',
        status: course.status,
      });
    } catch (err) {
      setError('Tải dữ liệu khóa học thất bại để chỉnh sửa.');
    } finally {
      setFetchingCourse(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isEditMode) {
        await courseService.updateCourse(id, formData);
        setSuccessMessage('Khóa học đã được cập nhật thành công!');
      } else {
        await courseService.createCourse(formData);
        setSuccessMessage('Khóa học đã được tạo thành công!');
      }

      setTimeout(() => navigate('/my-courses'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEditMode ? 'Cập nhật khóa học thất bại' : 'Tạo khóa học thất bại')
      );
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = isEditMode ? 'Chỉnh sửa Khóa học' : 'Tạo Khóa học Mới';

  if (fetchingCourse) {
    return <Loader message="Đang tải dữ liệu khóa học..." />;
  }

  return (
    <div className="create-course-page">
      <div className="container">
        <div className="form-wrapper">
          <header className="form-header">
            <h1>{pageTitle}</h1>
          </header>

          <div className="form-body">
            {successMessage && <Message type="success" message={successMessage} />}
            {error && <Message type="error" message={error} />}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tiêu đề khóa học"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Mô tả chi tiết về khóa học"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="form-group">
                <label htmlFor="price">Giá (0 là Miễn phí)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              {/* Status (Edit Mode Only) */}
              {isEditMode && (
                <div className="form-group">
                  <label htmlFor="status">Trạng thái</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Draft">Nháp</option>
                    <option value="Published">Xuất bản</option>
                    {/* Admin statuses will be handled by admin page */}
                  </select>
                  <small className="form-hint">
                    Chuyển sang "Xuất bản" sẽ gửi khóa học đến Admin để duyệt (nếu cần)
                  </small>
                </div>
              )}


              {/* Thumbnail URL */}
              <div className="form-group">
                <label htmlFor="thumbnailUrl">URL Ảnh thu nhỏ</label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                />
                <small className="form-hint">
                  Cung cấp một liên kết trực tiếp đến hình ảnh thu nhỏ khóa học của bạn
                </small>
                {formData.thumbnailUrl && (
                  <div className="thumbnail-preview">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Xem trước ảnh thu nhỏ"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/my-courses')}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? 'Đang lưu...'
                    : isEditMode
                    ? 'Cập nhật Khóa học'
                    : 'Tạo Khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
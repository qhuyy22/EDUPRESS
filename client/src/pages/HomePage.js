/**
 * HomePage Component
 * Main landing page displaying all approved courses
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import courseService from '../services/courseService';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Available categories
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
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (category) filters.category = category;
      if (sortBy) filters.sort = sortBy;

      const response = await courseService.getAllCourses(filters);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải khóa học thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Khám phá các Khóa học của chúng tôi</h1>
            <p className="hero-subtitle">
              Nâng cao kỹ năng của bạn với các khóa học trực tuyến từ các chuyên gia hàng đầu.
            </p>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học (ví dụ: React, Thiết kế, Marketing...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-search">
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="filter-sort-section">
        <div className="container">
          <div className="filter-sort-group">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả Danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="">Sắp xếp theo</option>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Được đánh giá cao nhất</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>
        </div>
      </section>

      <section className="courses-section" id="courses-section">
        <div className="container">
          {error && <Message type="error" message={error} />}

          {loading ? (
            <Loader message="Đang tải danh sách khóa học..." />
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <h3>Không tìm thấy khóa học nào</h3>
              <p>Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</p>
            </div>
          ) : (
            <>
              <h2 className="section-title">
                Khóa học hiện có ({courses.length})
              </h2>
              <div className="courses-grid">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
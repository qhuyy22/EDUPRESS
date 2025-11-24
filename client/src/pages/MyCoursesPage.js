/**
 * MyCoursesPage Component
 * Shows enrolled courses for customers or created courses for providers
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import CourseCard from '../components/CourseCard';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const { isProvider, isCustomer } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (isProvider()) {
        // Provider: Get courses they created
        response = await courseService.getMyCourses();
      } else if (isCustomer()) {
        // Customer: Get enrolled courses
        response = await courseService.getEnrolledCourses();
      }

      if (response.success) {
        // If customer, extract course from enrollment and calculate progress
        if (isCustomer()) {
          setCourses(
            response.data.map((enrollment) => ({
              ...enrollment.course,
              progress: enrollment.progress,
              completionPercentage: enrollment.completionPercentage, // Assuming backend provides this
              enrollmentDate: enrollment.enrollmentDate,
            }))
          );
        } else {
          // Provider
          setCourses(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Tải danh sách khóa học thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        setError('');
        setSuccess('');
        await courseService.deleteCourse(courseId);
        setSuccess('Khóa học đã được xóa thành công!');
        fetchMyCourses();
      } catch (err) {
        setError(err.response?.data?.message || 'Xóa khóa học thất bại');
      }
    }
  };

  const getPageTitle = () => {
    if (isProvider()) {
      return 'Khóa học đã Tạo';
    } else if (isCustomer()) {
      return 'Khóa học của Tôi';
    }
    return 'Khóa học';
  };

  const getEmptyMessage = () => {
    if (isProvider()) {
      return 'Bạn chưa tạo khóa học nào. Hãy bắt đầu tạo khóa học đầu tiên của mình!';
    }
    return 'Bạn chưa đăng ký khóa học nào. Hãy khám phá trang chủ để tìm khóa học mới!';
  };

  return (
    <div className="my-courses-page container">
      <header className="page-header">
        <h1>{getPageTitle()}</h1>
        {isProvider() && (
          <Link to="/course/create" className="btn-create-course">
            + Tạo Khóa học Mới
          </Link>
        )}
      </header>

      {success && <Message type="success" message={success} />}
      {error && <Message type="error" message={error} />}

      <div className="courses-content">
        {loading ? (
          <Loader message="Đang tải danh sách khóa học..." />
        ) : courses.length === 0 ? (
          <Message type="info" message={getEmptyMessage()} />
        ) : (
          <>
            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course._id} className="course-item">
                  <CourseCard course={course} />
                  
                  {isCustomer() && (
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.completionPercentage || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {course.completionPercentage || 0}% Hoàn thành
                      </span>
                    </div>
                  )}

                  {isProvider() && (
                    <div className="course-actions">
                      <Link
                        to={`/course/${course._id}/lessons`}
                        className="btn btn-primary btn-sm"
                      >
                        Quản lý Bài học
                      </Link>
                      <Link
                        to={`/course/${course._id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Chỉnh sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  )}

                  {!isProvider() && course.lessons && course.lessons.length > 0 && (
                    <div className="course-actions">
                      <Link
                        to={`/courses/${course._id}/lessons/${course.lessons[0]._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Tiếp tục Học ≫
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
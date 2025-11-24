/**
 * LessonPage Component
 * Video player page for enrolled students
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './LessonPage.css';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchCourseData();
    // eslint-disable-next-line
  }, [courseId]);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
    // eslint-disable-next-line
  }, [lessonId, course]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch course details
      const courseResponse = await courseService.getCourseById(courseId);
      setCourse(courseResponse.data);

      // Fetch progress
      const progressResponse = await progressService.getCourseProgress(courseId);
      setProgress(progressResponse.data.progress);
      setCompletionPercentage(progressResponse.data.completionPercentage);
      
      // Load first lesson if no lessonId is provided (e.g., /courses/:courseId)
      if (!lessonId && courseResponse.data.lessons.length > 0) {
        navigate(`/courses/${courseId}/lessons/${courseResponse.data.lessons[0]._id}`, { replace: true });
      }

    } catch (err) {
      setError(
        err.response?.data?.message || 'Tải dữ liệu khóa học thất bại. Vui lòng kiểm tra đăng ký.'
      );
      setCourse(null); // Clear course data on error
    } finally {
      setLoading(false);
    }
  };
  
  const loadLesson = (id) => {
    if (course && course.lessons) {
      const lesson = course.lessons.find((l) => l._id === id);
      if (lesson) {
        setCurrentLesson(lesson);
      } else {
        setError('Bài học không tồn tại.');
        setCurrentLesson(null);
      }
    }
  };

  const handleLessonClick = (lesson) => {
    if (lesson._id !== currentLesson._id) {
      navigate(`/courses/${courseId}/lessons/${lesson._id}`);
    }
  };

  const isLessonCompleted = useMemo(() => (lessonId) => {
    return progress.some(p => p.lesson === lessonId);
  }, [progress]);

  const handleMarkComplete = async () => {
    if (!currentLesson || isLessonCompleted(currentLesson._id)) return;

    setMarkingComplete(true);
    setError('');

    try {
      await progressService.markLessonComplete(courseId, currentLesson._id);
      
      // Update local state without full reload
      const updatedProgress = [...progress, { lesson: currentLesson._id }];
      setProgress(updatedProgress);
      
      // Recalculate completion percentage (simple logic: completed lessons / total lessons)
      const totalLessons = course.lessons.length;
      const completedLessons = updatedProgress.length;
      const newCompletionPercentage = Math.round((completedLessons / totalLessons) * 100);
      setCompletionPercentage(newCompletionPercentage);
      
      if (newCompletionPercentage === 100) {
        alert('Chúc mừng! Bạn đã hoàn thành khóa học!');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Đánh dấu hoàn thành thất bại.');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return <Loader message="Đang tải bài học..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
        <button className="btn-back" onClick={() => navigate('/my-courses')}>
          ← Quay lại Khóa học của tôi
        </button>
      </div>
    );
  }
  
  if (!currentLesson) {
     return (
        <div className="container" style={{ padding: '2rem' }}>
          <Message type="info" message="Vui lòng chọn một bài học từ danh sách bên cạnh." />
        </div>
      );
  }
  
  const isCompleted = isLessonCompleted(currentLesson._id);

  return (
    <div className="lesson-page">
      <div className="lesson-content-area">
        {error && <Message type="error" message={error} />}

        <div className="lesson-video-player">
          {currentLesson.videoUrl ? (
            <div className="video-embed">
              {/* NOTE: In a real app, this should use a secure video player component 
              and handle URL parsing (e.g., YouTube embed URL) for security and functionality.
              For simplicity, using an iframe here. */}
              <iframe
                title={currentLesson.title}
                src={currentLesson.videoUrl.replace('watch?v=', 'embed/')} // Simple YouTube embed conversion
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="no-video-placeholder">
              Không có video cho bài học này. Vui lòng xem nội dung văn bản.
            </div>
          )}
        </div>

        <div className="lesson-main-details">
          <h1>{currentLesson.title}</h1>

          <div className="lesson-actions-bar">
            {isCompleted ? (
              <span className="completion-status completed">
                ✓ Đã Hoàn thành
              </span>
            ) : (
              <button
                className="btn-mark-complete"
                onClick={handleMarkComplete}
                disabled={markingComplete}
              >
                {markingComplete ? 'Đang hoàn thành...' : 'Đánh dấu Hoàn thành'}
              </button>
            )}
          </div>
          
          <div className="lesson-text-content">
            {currentLesson.description && (
              <>
                <h2>Mô tả</h2>
                <p>{currentLesson.description}</p>
              </>
            )}
            
            {currentLesson.content && (
              <>
                <h2>Nội dung chi tiết</h2>
                {/* NOTE: In a real app, markdown or HTML content should be sanitized before rendering */}
                <div className="raw-content-display">
                  <pre>{currentLesson.content}</pre>
                </div>
              </>
            )}

            {!currentLesson.content && !currentLesson.videoUrl && (
               <p className="no-content">Bài học này chưa có nội dung hoặc video nào được cung cấp.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lesson-sidebar">
        <div className="course-header-sidebar">
          <button className="btn-back" onClick={() => navigate(`/courses/${courseId}`)}>
            ← Quay lại Khóa học
          </button>
          <h3>{course.title}</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">{completionPercentage}% Hoàn thành</span>
          </div>
        </div>

        <div className="lessons-list-sidebar">
          <h4>Nội dung Khóa học</h4>
          {course.lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              className={`lesson-item-sidebar ${
                currentLesson?._id === lesson._id ? 'active' : ''
              } ${isLessonCompleted(lesson._id) ? 'completed' : ''}`}
              onClick={() => handleLessonClick(lesson)}
            >
              <div className="lesson-number">{index + 1}</div>
              <div className="lesson-details">
                <h5>{lesson.title}</h5>
                <span className="lesson-duration">{lesson.duration} phút</span>
              </div>
              {isLessonCompleted(lesson._id) && (
                <span className="completion-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
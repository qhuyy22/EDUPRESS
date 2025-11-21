import React, { useState, useEffect } from 'react';
import courseService from '../services/courseService';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './AllCoursesPage.css';

const AllCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getAllCourses();
        if (response.success) {
          setCourses(response.data);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="all-courses-page">
      <div className="page-header">
        <h1>All Courses</h1>
        <p>Explore our wide range of courses and start learning today!</p>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message type="error" message={error} />
      ) : (
        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : (
            <p>No courses available at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;

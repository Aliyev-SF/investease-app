// src/pages/LearnPage.jsx (Updated to handle ?lesson=slug query param)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { getAllLessons, getLessonsByCategory, categories } from '../utils/lessonLoader';
import LessonViewer from '../components/LessonViewer';

function LearnPage({ userData }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    
    // Check if there's a lesson query parameter
    const lessonSlug = searchParams.get('lesson');
    if (lessonSlug) {
      setSelectedLesson(lessonSlug);
      // Clear the query parameter after setting the lesson
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProgress = async () => {
    if (!userData) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('lesson_slug, completed')
        .eq('user_id', userData.id)
        .eq('completed', true);

      setCompletedLessons(data ? data.map(d => d.lesson_slug) : []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonSlug) => {
    return completedLessons.includes(lessonSlug);
  };

  const getCompletionPercentage = () => {
    const total = getAllLessons().length;
    const completed = completedLessons.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleLessonClick = (lessonSlug) => {
    setSelectedLesson(lessonSlug);
  };

  const handleCloseLessonViewer = (nextLessonSlug) => {
    if (nextLessonSlug) {
      // Navigate to next lesson
      setSelectedLesson(nextLessonSlug);
    } else {
      // Close viewer
      setSelectedLesson(null);
      // Reload progress
      loadProgress();
    }
  };

  if (selectedLesson) {
    return (
      <LessonViewer
        lessonSlug={selectedLesson}
        userData={userData}
        onClose={handleCloseLessonViewer}
        onComplete={loadProgress}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();
  const allLessons = getAllLessons();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">📚 Learn to Invest</h2>
        <p className="text-gray">Master investing fundamentals with our beginner-friendly lessons</p>
      </div>

      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-90 mb-1">Your Progress</div>
            <div className="text-3xl font-bold">{completionPercentage}% Complete</div>
          </div>
          <div className="text-6xl">🎓</div>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-sm opacity-90 mt-2">
          {completedLessons.length} of {allLessons.length} lessons completed
        </div>
      </div>

      {/* Featured Lesson (First incomplete lesson) */}
      {completionPercentage < 100 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-dark mb-4">🎯 Continue Learning</h3>
          {allLessons
            .filter(lesson => !isLessonCompleted(lesson.slug))
            .slice(0, 1)
            .map(lesson => (
              <div
                key={lesson.slug}
                onClick={() => handleLessonClick(lesson.slug)}
                className="flex items-center gap-6 p-6 bg-primary bg-opacity-5 rounded-2xl border-2 border-primary cursor-pointer hover:bg-primary hover:bg-opacity-10 transition-all"
              >
                <div className="text-6xl">{lesson.icon}</div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-dark mb-1">{lesson.title}</div>
                  <div className="text-gray mb-2">{lesson.description}</div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-3 py-1 bg-white rounded-full text-primary font-semibold">
                      {lesson.duration} min
                    </span>
                    <span className="px-3 py-1 bg-white rounded-full text-primary font-semibold capitalize">
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-primary font-bold text-lg">
                  Start →
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Lessons by Category */}
      {Object.entries(categories).map(([categoryKey, category]) => {
        const categoryLessons = getLessonsByCategory(categoryKey);
        
        if (categoryLessons.length === 0) return null;

        return (
          <div key={categoryKey} className="mb-8">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{category.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-dark">{category.name}</h3>
                <p className="text-gray text-sm">{category.description}</p>
              </div>
            </div>

            {/* Lesson Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryLessons.map(lesson => {
                const isCompleted = isLessonCompleted(lesson.slug);
                
                return (
                  <div
                    key={lesson.slug}
                    onClick={() => handleLessonClick(lesson.slug)}
                    className={`bg-white rounded-2xl p-6 shadow-md cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                      isCompleted ? 'border-2 border-success' : 'border border-gray-200'
                    }`}
                  >
                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="flex justify-end mb-2">
                        <div className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-full text-xs font-bold flex items-center gap-1">
                          <span>✓</span>
                          <span>Complete</span>
                        </div>
                      </div>
                    )}

                    {/* Lesson Icon */}
                    <div className="text-5xl mb-3">{lesson.icon}</div>

                    {/* Lesson Info */}
                    <h4 className="text-xl font-bold text-dark mb-2">{lesson.title}</h4>
                    <p className="text-gray text-sm mb-4">{lesson.description}</p>

                    {/* Meta Info */}
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {lesson.duration} min
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Completion Celebration */}
      {completionPercentage === 100 && (
        <div className="bg-gradient-to-r from-success to-success-dark rounded-3xl p-8 text-white text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold mb-2">Congratulations!</h3>
          <p className="text-lg opacity-90">
            You've completed all lessons! You're well on your way to becoming a confident investor.
          </p>
          <button
            onClick={() => handleLessonClick(allLessons[0].slug)}
            className="mt-6 px-6 py-3 bg-white text-success rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Review Lessons
          </button>
        </div>
      )}
    </div>
  );
}

export default LearnPage;
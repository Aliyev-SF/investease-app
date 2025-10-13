// src/pages/LearnPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getAllLessons, getLessonsByCategory, categories } from '../utils/lessonLoader';
import LessonViewer from '../components/LessonViewer';

function LearnPage({ userData }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
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
        .select('lesson_id, completed')
        .eq('user_id', userData.id)
        .eq('completed', true);

      setCompletedLessons(data ? data.map(d => d.lesson_id) : []);
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

      {/* Lesson Categories */}
      <div className="space-y-6">
        {Object.entries(categories).map(([categorySlug, category]) => {
          const categoryLessons = getLessonsByCategory(categorySlug);
          const completedCount = categoryLessons.filter(l => isLessonCompleted(l.slug)).length;

          return (
            <div key={categorySlug} className="bg-white rounded-3xl p-6 shadow-lg">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{category.name}</h3>
                    <p className="text-sm text-gray">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {completedCount}/{categoryLessons.length}
                  </div>
                  <div className="text-xs text-gray">completed</div>
                </div>
              </div>

              {/* Category Lessons */}
              <div className="space-y-3">
                {categoryLessons.map(lesson => {
                  const completed = isLessonCompleted(lesson.slug);

                  return (
                    <div
                      key={lesson.slug}
                      onClick={() => handleLessonClick(lesson.slug)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        completed
                          ? 'border-success bg-success bg-opacity-5 hover:bg-opacity-10'
                          : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
                      }`}
                    >
                      {/* Lesson Icon & Status */}
                      <div className="relative">
                        <div className="text-4xl">{lesson.icon}</div>
                        {completed && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1">
                        <div className="font-bold text-dark text-lg">{lesson.title}</div>
                        <div className="text-sm text-gray">{lesson.description}</div>
                      </div>

                      {/* Lesson Meta */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm text-gray">{lesson.duration} min</div>
                        <div className={`text-xs px-2 py-1 rounded-full capitalize ${
                          lesson.difficulty === 'beginner' 
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {lesson.difficulty}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className={`text-xl ${completed ? 'text-success' : 'text-primary'}`}>
                        {completed ? '✓' : '→'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div className="mt-8 bg-gradient-to-r from-success to-primary rounded-3xl p-8 text-white text-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-3xl font-bold mb-2">Congratulations!</div>
          <div className="text-lg opacity-90 mb-6">
            You've completed all lessons! You're well on your way to becoming a confident investor.
          </div>
          <div className="text-sm opacity-75">
            Keep practicing on InvestEase to build real-world skills!
          </div>
        </div>
      )}
    </div>
  );
}

export default LearnPage;
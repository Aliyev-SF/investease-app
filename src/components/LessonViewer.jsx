// src/components/LessonViewer.jsx
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../utils/supabase';
import { getLessonBySlug, getLessonContent, getNextLesson, getPreviousLesson } from '../utils/lessonLoader';
import { trackLessonStart, trackLessonEnd } from '../utils/analytics';

function LessonViewer({ lessonSlug, userData, onClose, onComplete }) {
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState('');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [lessonViewId, setLessonViewId] = useState(null);
  const [lessonStartTime, setLessonStartTime] = useState(null);

  useEffect(() => {
  if (userData?.id && lessonSlug) {
    const startTracking = async () => {
      const viewId = await trackLessonStart(userData.id, lessonSlug);
      setLessonViewId(viewId);
      setLessonStartTime(new Date());
    };
    startTracking();
  }
}, [userData, lessonSlug]);

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug]);

  const loadLesson = async () => {
    // Reset completion state immediately to prevent stale state
    setCompleted(false);
    
    // Get lesson metadata
    const lessonMeta = getLessonBySlug(lessonSlug);
    setLesson(lessonMeta);

    // Get lesson content
    const lessonHTML = getLessonContent(lessonSlug);
    setContent(lessonHTML);

    // Check if user already completed this lesson
    if (userData) {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('completed')
        .eq('user_id', userData.id)
        .eq('lesson_slug', lessonSlug)
        .single();

      // Update completion status - defaults to false if no record exists
      if (data && !error) {
        setCompleted(data.completed);
      } else {
        setCompleted(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!userData) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', userData.id)
        .eq('lesson_slug', lessonSlug)  // ✅ FIXED: Changed from lesson_id
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            time_spent_seconds: timeSpent
          })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: userData.id,
            lesson_slug: lessonSlug,  // ✅ FIXED: Changed from lesson_id
            completed: true,
            completed_at: new Date().toISOString(),
            time_spent_seconds: timeSpent
          });
      }

      setCompleted(true);
      if (onComplete) onComplete();
      
      // Show success message
      alert('🎉 Lesson completed! Great job!');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Oops! There was an error saving your progress. Please try again.');
    }
  };

  const handleNext = () => {
    const nextLesson = getNextLesson(lessonSlug);
    if (nextLesson && onClose) {
      onClose(nextLesson.slug); // Navigate to next lesson
    }
  };

  const handlePrevious = () => {
    const prevLesson = getPreviousLesson(lessonSlug);
    if (prevLesson && onClose) {
      onClose(prevLesson.slug); // Navigate to previous lesson
    }
  };

  const handleClose = async () => {
  // Track lesson end
  if (lessonViewId && lessonStartTime) {
    await trackLessonEnd(lessonViewId, lessonStartTime);
  }
  
  // Then close
  if (onClose) {
    onClose();
  }
};

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl font-bold text-primary">Loading lesson...</div>
      </div>
    );
  }

  const nextLesson = getNextLesson(lessonSlug);
  const prevLesson = getPreviousLesson(lessonSlug);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-gray hover:text-dark transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">Back to Lessons</span>
          </button>
          <div className="text-sm text-gray">
            {lesson.duration} min read · {lesson.difficulty}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="text-6xl mb-4">{lesson.icon}</div>
          <div className="inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-semibold mb-4">
            {lesson.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </div>
          <h1 className="text-4xl font-bold text-dark mb-2">{lesson.title}</h1>
          <p className="text-lg text-gray">{lesson.description}</p>
        </div>

        {/* Lesson Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            lineHeight: '1.8',
            fontSize: '1.125rem'
          }}
        />

        {/* Completion Section */}
        <div className="border-t border-gray-200 pt-8">
          {completed ? (
            <div className="bg-success bg-opacity-10 border-2 border-success rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-xl font-bold text-success mb-2">Lesson Complete!</div>
                <div className="text-dark">Great job! You've mastered this topic.</div>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleComplete}
              >
                Mark as Complete ✓
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={!prevLesson}
              className="flex-1"
            >
              {prevLesson ? `← Previous: ${prevLesson.title}` : '← No Previous Lesson'}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!nextLesson}
              className="flex-1"
            >
              {nextLesson ? `Next: ${nextLesson.title} →` : 'Course Complete! →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add custom styles for prose */}
      <style>{`
        .prose h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1a202c;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #1a202c;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #1a202c;
        }
        .prose p {
          margin-bottom: 1rem;
          color: #4a5568;
        }
        .prose ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          color: #4a5568;
        }
        .prose strong {
          color: #1a202c;
          font-weight: 600;
        }
        .prose .lead {
          font-size: 1.25rem;
          color: #667eea;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .prose .text-center {
          text-align: center;
        }
        .prose .mt-6 {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

export default LessonViewer;
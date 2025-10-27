// src/components/SuggestionCard.jsx
import { useState } from 'react';
import Button from './Button';

function SuggestionCard({ 
  icon = '💡',
  title,
  message,
  lessonTitle,
  lessonSlug,
  lessonDuration,
  lessonCategory,
  variant = 'primary', // primary, success, warning, info
  onLearnClick,
  onDismiss
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Variant-specific styling
  const variantStyles = {
    primary: 'from-primary to-primary-dark',
    success: 'from-success to-green-600',
    warning: 'from-warning to-orange-600',
    info: 'from-blue-500 to-blue-600'
  };

  const handleLearnClick = () => {
    if (onLearnClick) {
      onLearnClick(lessonSlug);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if dismissed
  if (isDismissed) return null;

  return (
    <div 
      className={`bg-gradient-to-r ${variantStyles[variant]} rounded-3xl p-6 mb-6 text-white shadow-lg relative animate-fadeIn`}
    >
      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
        aria-label="Dismiss suggestion"
      >
        <span className="text-white text-lg leading-none">×</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      {/* Message */}
      <p className="text-white text-opacity-95 mb-4 leading-relaxed">
        {message}
      </p>

      {/* Lesson Info Card */}
      <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="font-semibold mb-1">
          📖 Recommended Lesson: "{lessonTitle}"
        </div>
        <div className="text-sm text-white text-opacity-90">
          ⏱️ {lessonDuration} min read
          {lessonCategory && ` · ${lessonCategory}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleLearnClick}
          className="flex-1 bg-white text-primary hover:shadow-lg hover:-translate-y-0.5"
        >
          Learn Now →
        </Button>
        <Button
          variant="ghost"
          onClick={handleDismiss}
          className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 hover:bg-opacity-30"
        >
          Maybe Later
        </Button>
      </div>

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default SuggestionCard;
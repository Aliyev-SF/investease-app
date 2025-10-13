// src/components/Tooltip.jsx
import { useState } from 'react';
import { supabase } from '../utils/supabase';

function Tooltip({ term, content, userData, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);

  const handleMouseEnter = async () => {
    setIsVisible(true);
    
    // Track that user viewed this term (only once per session)
    if (userData && !hasTracked) {
      try {
        await supabase.from('user_term_views').insert({
          user_id: userData.id,
          term_slug: term.toLowerCase().replace(/\s+/g, '-')
        });
        setHasTracked(true);
      } catch {
        // Silently fail - tracking is nice-to-have
        console.log('Term view tracking skipped');
      }
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Position classes based on prop
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-dark border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-dark border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-dark border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-dark border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <span className="relative inline-block">
      {/* Tooltip Trigger */}
      <button
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-label={`Learn about ${term}`}
      >
        ?
      </button>

      {/* Tooltip Content */}
      {isVisible && (
        <div
          className={`absolute z-50 w-72 px-4 py-3 text-sm text-white bg-dark rounded-lg shadow-xl ${positionClasses[position]} animate-fade-in`}
          role="tooltip"
        >
          {/* Term Title */}
          <div className="font-bold text-base mb-2 text-primary">{term}</div>
          
          {/* Content */}
          <div 
            className="text-white leading-relaxed prose prose-sm prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            style={{ borderWidth: '6px' }}
          />
        </div>
      )}

      {/* Custom fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </span>
  );
}

export default Tooltip;
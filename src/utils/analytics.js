// src/utils/analytics.js
// Analytics tracking utility

import { supabase } from '../services/database/supabase';

// Session management
let currentSessionId = null;
let sessionStartTime = null;
let pageStartTime = null;

// Initialize session when user logs in or app loads
export const initializeSession = async (userId) => {
  if (!userId) return;

  // Generate new session ID
  currentSessionId = crypto.randomUUID();
  sessionStartTime = new Date();

  try {
    await supabase
      .from('user_sessions')
      .insert({
        id: currentSessionId,
        user_id: userId,
        session_start: sessionStartTime.toISOString(),
        page_count: 0
      });
  } catch (error) {
    console.error('Error initializing session:', error);
  }
};

// End session when user logs out or closes app
export const endSession = async () => {
  if (!currentSessionId || !sessionStartTime) return;

  const sessionEndTime = new Date();
  const durationSeconds = Math.floor((sessionEndTime - sessionStartTime) / 1000);

  try {
    await supabase
      .from('user_sessions')
      .update({
        session_end: sessionEndTime.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('id', currentSessionId);
  } catch (error) {
    console.error('Error ending session:', error);
  }

  currentSessionId = null;
  sessionStartTime = null;
};

// Track page view
export const trackPageView = async (userId, pageName, pagePath = window.location.pathname) => {
  if (!userId) return;

  // End previous page timing
  if (pageStartTime) {
    const pageEndTime = new Date();
    const durationSeconds = Math.floor((pageEndTime - pageStartTime) / 1000);
    
    // Could store page duration in analytics_events if needed
    if (durationSeconds > 0) {
      await trackEvent(userId, 'page_duration', {
        duration_seconds: durationSeconds
      });
    }
  }

  // Start new page timing
  pageStartTime = new Date();

  try {
    await supabase
      .from('page_views')
      .insert({
        user_id: userId,
        page_name: pageName,
        page_path: pagePath,
        session_id: currentSessionId,
        viewed_at: new Date().toISOString()
      });

    // Update session page count
    if (currentSessionId) {
      await supabase.rpc('increment_session_page_count', {
        session_id: currentSessionId
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track lesson view (start)
export const trackLessonStart = async (userId, lessonSlug) => {
  if (!userId) return;

  const lessonViewId = crypto.randomUUID();

  try {
    await supabase
      .from('lesson_views')
      .insert({
        id: lessonViewId,
        user_id: userId,
        lesson_slug: lessonSlug,
        started_at: new Date().toISOString()
      });

    return lessonViewId; // Return ID so we can update when lesson ends
  } catch (error) {
    console.error('Error tracking lesson start:', error);
    return null;
  }
};

// Track lesson view (end)
export const trackLessonEnd = async (lessonViewId, lessonStartTime) => {
  if (!lessonViewId || !lessonStartTime) return;

  const lessonEndTime = new Date();
  const durationSeconds = Math.floor((lessonEndTime - lessonStartTime) / 1000);

  try {
    await supabase
      .from('lesson_views')
      .update({
        ended_at: lessonEndTime.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('id', lessonViewId);
  } catch (error) {
    console.error('Error tracking lesson end:', error);
  }
};

// Track custom event
export const trackEvent = async (userId, eventType, eventData = {}) => {
  if (!userId) return;

  try {
    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        occurred_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Helper: Track trade executed
export const trackTrade = async (userId, symbol, type, shares, price, total) => {
  return trackEvent(userId, 'trade_executed', {
    symbol,
    type,
    shares,
    price,
    total
  });
};

// Helper: Track suggestion interaction
export const trackSuggestionInteraction = async (userId, suggestionId, action) => {
  return trackEvent(userId, 'suggestion_interaction', {
    suggestion_id: suggestionId,
    action // 'shown', 'clicked', 'dismissed'
  });
};

// Helper: Track lesson completion
export const trackLessonCompletion = async (userId, lessonSlug, timeSpent) => {
  return trackEvent(userId, 'lesson_completed', {
    lesson_slug: lessonSlug,
    time_spent_seconds: timeSpent
  });
};

// Get current session ID (useful for debugging)
export const getCurrentSessionId = () => currentSessionId;
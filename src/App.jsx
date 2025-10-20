// src/App.jsx (Updated with confidence score integration)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import { ToastProvider } from './components/ToastContainer';

// Page Components
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketPage from './pages/MarketPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import LearnPage from './pages/LearnPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [userData, setUserData] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(3.2);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setCurrentView('login');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event) => {
      if (_event === 'SIGNED_OUT') {
        setUserData(null);
        setConfidenceScore(3.2);
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUserData({
        id: userId,
        email: profileData.email,
        name: profileData.name,
        age: profileData.age,
        experience: profileData.experience,
        returning: true
      });

      // ✅ Load confidence score from profile (new column!)
      setConfidenceScore(profileData.confidence_score || 3.2);
      setCurrentView('app');
    } catch (error) {
      console.error('Error loading profile:', error);
      setCurrentView('login');
    }
  };

  const handleLogin = (data) => {
    setUserData(data);
    
    if (data.returning) {
      // Load their existing confidence score
      setConfidenceScore(data.confidence_score || 3.2);
      setCurrentView('app');
    } else {
      setCurrentView('assessment');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    setConfidenceScore(3.2);
    setCurrentView('login');
  };

  const handleAssessmentComplete = async (score) => {
    setConfidenceScore(score);
    
    // Update profile with initial confidence score
    try {
      await supabase
        .from('profiles')
        .update({ confidence_score: score })
        .eq('id', userData.id);
      
      // Also add to confidence_history
      await supabase
        .from('confidence_history')
        .insert([{
          user_id: userData.id,
          score: score,
          recorded_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error updating initial confidence score:', error);
    }
    
    setCurrentView('app');
  };

  // ✅ NEW: Handle confidence score updates from MarketPage
  const handleConfidenceUpdate = (newScore) => {
    const updatedScore = Math.min(10, newScore);
    setConfidenceScore(updatedScore);
    
    // Note: Database update is handled by confidenceCalculator.js
    // We just update the React state here for immediate UI feedback
  };

  // Loading state
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-4">InvestEase</div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Login view
  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Assessment view
  if (currentView === 'assessment') {
    return (
      <AssessmentPage 
        userData={userData} 
        onComplete={handleAssessmentComplete} 
      />
    );
  }

  // Main app with routing - WRAPPED WITH TOASTPROVIDER & LAYOUT
  return (
    <Router>
      <ToastProvider>
        <Layout onLogout={handleLogout} userData={userData} confidenceScore={confidenceScore}>
          <Routes>
            <Route 
              path="/" 
              element={
                <DashboardPage 
                  userData={userData} 
                  confidenceScore={confidenceScore}
                />
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <PortfolioPage 
                  userData={userData} 
                />
              } 
            />
            <Route 
              path="/market" 
              element={
                <MarketPage 
                  userData={userData}
                  onConfidenceUpdate={handleConfidenceUpdate}
                />
              } 
            />
            <Route 
              path="/history" 
              element={<HistoryPage userData={userData} />} 
            />
            <Route 
              path="/progress" 
              element={
                <ProgressPage 
                  userData={userData} 
                  confidenceScore={confidenceScore}
                />
              } 
            />
            <Route 
              path="/learn" 
              element={<LearnPage userData={userData} />} 
            />
            <Route 
              path="/analytics" 
              element={<AnalyticsDashboardPage userData={userData} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </Router>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';

// Page Components
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketPage from './pages/MarketPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';

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

      setCurrentView('app');
    } catch (error) {
      console.error('Error loading profile:', error);
      setCurrentView('login');
    }
  };

  const handleLogin = (data) => {
    setUserData(data);
    
    if (data.returning) {
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

  const handleAssessmentComplete = (score) => {
    setConfidenceScore(score);
    setCurrentView('app');
  };

  const handleConfidenceUpdate = (newScore) => {
    const updatedScore = Math.min(10, newScore);
    setConfidenceScore(updatedScore);
    
    // Save to confidence history
    saveConfidenceHistory(updatedScore);
  };

  const saveConfidenceHistory = async (score) => {
    try {
      if (userData?.id) {
        await supabase.from('confidence_history').insert([{
          user_id: userData.id,
          score: score,
          recorded_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error saving confidence history:', error);
    }
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

  // Main app with routing
  return (
    <Router>
      <Layout 
        userData={userData} 
        confidenceScore={confidenceScore}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage 
                userData={userData}
              />
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <PortfolioPage 
                userData={userData}
                confidenceScore={confidenceScore}
                onConfidenceUpdate={handleConfidenceUpdate}
              />
            } 
          />
          <Route 
            path="/market" 
            element={
              <MarketPage 
                userData={userData}
                confidenceScore={confidenceScore}
                onConfidenceUpdate={handleConfidenceUpdate}
              />
            } 
          />
          <Route 
            path="/history" 
            element={
              <HistoryPage 
                userData={userData}
              />
            } 
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
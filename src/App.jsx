import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentView, setCurrentView] = useState('loading'); // Start with loading
  const [userData, setUserData] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(3.2);

  // Check for existing session on mount
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User has active session - load their profile and go to dashboard
        loadUserProfile(session.user.id);
      } else {
        // No session - show login
        setCurrentView('login');
      }
    });

    // Listen for auth changes (login/logout)
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

      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error loading profile:', error);
      setCurrentView('login');
    }
  };

  const handleLogin = (data) => {
    setUserData(data);
    
    // If returning user, skip assessment and go straight to dashboard
    if (data.returning) {
      setCurrentView('dashboard');
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
    setCurrentView('dashboard');
  };

  // Show loading while checking session
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

  // Render the appropriate page based on currentView
  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === 'assessment') {
    return (
      <AssessmentPage 
        userData={userData} 
        onComplete={handleAssessmentComplete} 
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardPage 
        userData={userData} 
        confidenceScore={confidenceScore}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;
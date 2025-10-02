import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(3.2);

  const handleLogin = (data) => {
    setUserData(data);
    
    // If returning user, skip assessment and go straight to dashboard
    if (data.returning) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('assessment');
    }
  };

  const handleAssessmentComplete = (score) => {
    setConfidenceScore(score);
    setCurrentView('dashboard');
  };

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
      />
    );
  }

  return null;
}

export default App;
import { useState } from 'react';
import { supabase } from '../../services/database/supabase';

function AssessmentPage({ userData, onComplete }) {
  const [answers, setAnswers] = useState({
    confidenceLevel: null,
    mainWorry: '',
    investmentGoal: ''
  });

  const [selectedScale, setSelectedScale] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleScaleClick = (value) => {
    setSelectedScale(value);
    setAnswers({
      ...answers,
      confidenceLevel: value
    });
  };

  const handleSelectChange = (e) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!answers.confidenceLevel || !answers.mainWorry || !answers.investmentGoal) {
      alert('Please answer all questions');
      return;
    }

    setSaving(true);

    try {
      // Calculate initial confidence score (weighted average)
      // Base score from their self-rating, adjusted down slightly to show room for growth
      const initialScore = answers.confidenceLevel * 0.7 + 2;

      // Save assessment data to Supabase
      const { error } = await supabase
        .from('assessments')
        .insert([
          {
            user_id: userData.id,
            confidence_level: answers.confidenceLevel,
            main_worry: answers.mainWorry,
            investment_goal: answers.investmentGoal,
            initial_score: initialScore,
            completed_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Also store in localStorage as backup (optional)
      const assessmentData = {
        ...answers,
        initialScore: initialScore,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('investease_assessment', JSON.stringify(assessmentData));

      // Call onComplete with the calculated score
      onComplete(initialScore);

    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Error saving assessment. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-900 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-10 max-w-3xl w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-dark mb-3">
            Confidence Assessment
          </h1>
          <p className="text-gray text-lg">
            Welcome, {userData.name}! Let's understand where you're starting from
          </p>
        </div>

        {/* Question 1: Confidence Scale */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-dark mb-4">
            1. How confident do you feel about investing in stocks?
          </h3>
          
          {/* Scale Selector */}
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleScaleClick(num)}
                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 hover:shadow-lg ${
                  selectedScale === num
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-dark hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray">
            <span>Not confident at all</span>
            <span>Very confident</span>
          </div>
        </div>

        {/* Question 2: Main Worry */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-dark mb-4">
            2. What's your biggest worry about investing?
          </h3>
          <select
            name="mainWorry"
            value={answers.mainWorry}
            onChange={handleSelectChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-dark"
          >
            <option value="">Select your main concern</option>
            <option value="losing_money">Losing my money</option>
            <option value="not_understanding">Not understanding how it works</option>
            <option value="making_mistakes">Making costly mistakes</option>
            <option value="market_crashes">Market crashes</option>
            <option value="scams">Getting scammed or misled</option>
            <option value="timing">Buying at the wrong time</option>
          </select>
        </div>

        {/* Question 3: Investment Goal */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-dark mb-4">
            3. What's your investment goal?
          </h3>
          <select
            name="investmentGoal"
            value={answers.investmentGoal}
            onChange={handleSelectChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-dark"
          >
            <option value="">Select your primary goal</option>
            <option value="retirement">Retirement savings</option>
            <option value="house">Saving for a house</option>
            <option value="wealth">Building long-term wealth</option>
            <option value="passive">Passive income</option>
            <option value="learning">Learning to invest</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {saving ? 'Saving...' : 'Start Practice Mode'}
        </button>
      </div>
    </div>
  );
}

export default AssessmentPage;
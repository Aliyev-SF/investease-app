import { useState } from 'react';
import { supabase } from '../utils/supabase';

function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    experience: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields for sign up
      if (!formData.email || !formData.password || !formData.name || !formData.age || !formData.experience) {
        alert('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Store user profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            age: formData.age,
            experience: formData.experience,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      // Create initial portfolio for user
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .insert([
          {
            user_id: authData.user.id,
            cash: 10000,
            holdings: [],
            total_value: 10000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (portfolioError) throw portfolioError;

      // Pass user data to parent component
      onLogin({
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        age: formData.age,
        experience: formData.experience
      });

    } catch (error) {
      alert(error.message || 'Error signing up');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email and password
      if (!formData.email || !formData.password) {
        alert('Please enter email and password');
        setLoading(false);
        return;
      }

      // Login with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Get user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // Pass user data to parent component
      onLogin({
        id: authData.user.id,
        email: profileData.email,
        name: profileData.name,
        age: profileData.age,
        experience: profileData.experience,
        returning: true // Flag to skip assessment
      });

    } catch (error) {
      alert(error.message || 'Error logging in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">InvestEase</h1>
          <p className="text-gray">Build confidence through practice investing</p>
        </div>

        {/* Sign Up / Login Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              isSignUp
                ? 'bg-white text-primary shadow-md'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? 'bg-white text-primary shadow-md'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isSignUp ? "At least 6 characters" : "Your password"}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Profile Fields - Only show for Sign Up */}
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sarah Chen"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  required={isSignUp}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Age Range
                </label>
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  required={isSignUp}
                >
                  <option value="">Select your age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Investment Experience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  required={isSignUp}
                >
                  <option value="">Select your experience</option>
                  <option value="none">Never invested before</option>
                  <option value="minimal">Minimal (tried once or twice)</option>
                  <option value="some">Some experience</option>
                  <option value="experienced">Experienced investor</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-primary font-semibold hover:underline"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
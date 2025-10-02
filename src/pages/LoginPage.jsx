import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    experience: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.age || !formData.experience) {
      alert('Please fill in all fields');
      return;
    }

    // Store user data in localStorage (browser storage)
    localStorage.setItem('investease_user', JSON.stringify(formData));
    
    // Call the onLogin function to navigate to assessment
    onLogin(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-700 to-purple-900 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <h1 className="text-primary text-5xl font-bold mb-3">
            InvestEase
          </h1>
          <p className="text-gray text-lg">
            Build confidence before investing real money
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-dark font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-dark font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Age Range Field */}
          <div>
            <label className="block text-dark font-semibold mb-2">
              Age Range
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            >
              <option value="">Select your age range</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>

          {/* Experience Field */}
          <div>
            <label className="block text-dark font-semibold mb-2">
              Investment Experience
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            >
              <option value="">Select your experience level</option>
              <option value="none">No experience</option>
              <option value="minimal">Minimal (401k only)</option>
              <option value="some">Some experience</option>
              <option value="experienced">Experienced investor</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary-dark transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
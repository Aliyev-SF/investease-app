import { Link, useLocation } from 'react-router-dom';

function Layout({ children, userData, confidenceScore, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/portfolio', icon: '💼', label: 'Portfolio' },
    { path: '/market', icon: '📈', label: 'Market' },
    { path: '/history', icon: '📜', label: 'History' },
  ];

  const futureNavItems = [
    { path: '/learn', icon: '📚', label: 'Learn', disabled: true },
    { path: '/progress', icon: '🏆', label: 'Progress', disabled: true },
  ];

  const settingsItems = [
    { path: '/settings', icon: '⚙️', label: 'Settings', disabled: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-light flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <h1 className="text-primary text-3xl font-bold">InvestEase</h1>
            
            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Practice Mode Badge */}
              <div className="bg-warning text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                PRACTICE MODE
              </div>
              
              {/* Confidence Score */}
              <div className="bg-white border-2 border-primary rounded-xl px-4 py-2">
                <div className="text-xs text-gray">Your Confidence</div>
                <div className="text-lg font-bold text-primary">
                  {confidenceScore.toFixed(1)}/10
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray">Welcome back</div>
                  <div className="font-semibold text-dark">{userData.name}</div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-dark px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-dark text-white flex-shrink-0 overflow-y-auto">
          <nav className="py-6">
            {/* Main Navigation */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-all border-l-4 ${
                  isActive(item.path)
                    ? 'bg-primary bg-opacity-10 text-primary border-primary'
                    : 'border-transparent text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 mx-6 border-t border-gray-700"></div>

            {/* Future Features */}
            {futureNavItems.map((item) => (
              <div
                key={item.path}
                className="flex items-center gap-3 px-6 py-3 text-gray-600 cursor-not-allowed opacity-50"
                title="Coming Soon"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                <span className="text-xs ml-auto">Soon</span>
              </div>
            ))}

            {/* Divider */}
            <div className="my-4 mx-6 border-t border-gray-700"></div>

            {/* Settings */}
            {settingsItems.map((item) => (
              <div
                key={item.path}
                className="flex items-center gap-3 px-6 py-3 text-gray-600 cursor-not-allowed opacity-50"
                title="Coming Soon"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                <span className="text-xs ml-auto">Soon</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
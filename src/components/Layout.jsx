import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ children, userData, confidenceScore, onLogout }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load sidebar preference from localStorage (desktop only)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Save preference when changed
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

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
        <div className="px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <svg className="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              <h1 className="text-primary text-2xl sm:text-3xl font-bold">InvestEase</h1>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Practice Mode Badge - Hidden on small mobile */}
              <div className="bg-warning text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm animate-pulse hidden xs:block">
                PRACTICE
              </div>
              
              {/* Confidence Score */}
              <div className="bg-white border-2 border-primary rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2">
                <div className="text-xs font-bold text-primary">
                  {confidenceScore.toFixed(1)}/10
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center gap-2">
                {/* User name - hidden on mobile */}
                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray">Welcome</div>
                  <div className="font-semibold text-dark text-sm">{userData.name}</div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-dark px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: Always visible | Mobile: Slide-in overlay */}
        <aside 
          className={`
            bg-dark text-white flex-shrink-0 overflow-y-auto transition-all duration-300 z-40
            ${sidebarCollapsed ? 'w-20' : 'w-60'}
            lg:relative lg:translate-x-0
            fixed inset-y-0 left-0 
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '73px' }} // Below header
        >
          {/* Toggle Button - Desktop only */}
          <div className="p-4 border-b border-gray-700 hidden lg:block">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="text-2xl">
                {sidebarCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>

          <nav className="py-4">
            {/* Main Navigation */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-4 transition-all border-l-4 ${
                  isActive(item.path)
                    ? 'bg-primary bg-opacity-10 text-primary border-primary'
                    : 'border-transparent text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="text-2xl">{item.icon}</span>
                {!sidebarCollapsed && <span className="font-medium text-lg">{item.label}</span>}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 mx-6 border-t border-gray-700"></div>

            {/* Future Features */}
            {futureNavItems.map((item) => (
              <div
                key={item.path}
                className="flex items-center gap-3 px-6 py-4 text-gray-600 cursor-not-allowed opacity-50"
                title={sidebarCollapsed ? `${item.label} (Coming Soon)` : 'Coming Soon'}
              >
                <span className="text-2xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium text-lg">{item.label}</span>
                    <span className="text-xs ml-auto">Soon</span>
                  </>
                )}
              </div>
            ))}

            {/* Divider */}
            <div className="my-4 mx-6 border-t border-gray-700"></div>

            {/* Settings */}
            {settingsItems.map((item) => (
              <div
                key={item.path}
                className="flex items-center gap-3 px-6 py-4 text-gray-600 cursor-not-allowed opacity-50"
                title={sidebarCollapsed ? `${item.label} (Coming Soon)` : 'Coming Soon'}
              >
                <span className="text-2xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium text-lg">{item.label}</span>
                    <span className="text-xs ml-auto">Soon</span>
                  </>
                )}
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
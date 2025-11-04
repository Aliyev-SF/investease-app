// src/components/layout/Layout.jsx
// Main layout component with header, sidebar navigation, and content area
// ✨ FINAL VERSION: Practice Mode badge only in header (no confidence score)

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserDropdown from './UserDropdown';
import { LogoStacked } from '../brand/InvesteaseLogo';
import { HomeIcon } from '../brand/icons/HomeIcon';
import { PortfolioIcon } from '../brand/icons/PortfolioIcon';
import { MarketIcon } from '../brand/icons/MarketIcon';
import { LearnIcon } from '../brand/icons/LearnIcon';
import { HistoryIcon } from '../brand/icons/HistoryIcon';
import { ProgressIcon } from '../brand/icons/ProgressIcon';
import { SettingsIcon } from '../brand/icons/SettingsIcon';
import BottomNav from './BottomNav';


function Layout({ children, userData, onLogout }) {
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
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', isComponent: true },
    { path: '/market', icon: MarketIcon, label: 'Market', isComponent: true },
    { path: '/learn', icon: LearnIcon, label: 'Learn', isComponent: true },
    { path: '/progress', icon: ProgressIcon, label: 'Progress', isComponent: true },
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
              
              {/* Logo - Stacked (Responsive) */}
              <div className="flex items-center">
                <LogoStacked 
                  width={window.innerWidth < 640 ? 100 : 120} 
                  height={window.innerWidth < 640 ? 70 : 85} 
                />
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* ✨ NEW: User Dropdown with Practice Mode */}
              <UserDropdown userName={userData.name} onLogout={onLogout} />
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
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-4 transition-all border-l-4 ${
                    active
                      ? 'bg-primary bg-opacity-10 text-primary border-primary'
                      : 'border-transparent text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  {/* Render icon - either component or emoji */}
                  {item.isComponent ? (
                    <IconComponent size={28} isActive={active} />
                  ) : (
                    <span className="text-2xl">{item.icon}</span>
                  )}
                  
                  {!sidebarCollapsed && <span className="font-medium text-lg">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-light pb-16 lg:pb-0">
            {children}
          </main>

          {/* Bottom Navigation - Mobile Only */}
          <BottomNav />
      </div>
    </div>
  );
}

export default Layout;
// src/components/layout/BottomNav.jsx
// Mobile bottom navigation bar (hidden on desktop)

import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from '../brand/icons/HomeIcon';
import { MarketIcon } from '../brand/icons/MarketIcon';
import { ProgressIcon } from '../brand/icons/ProgressIcon';
import { LearnIcon } from '../brand/icons/LearnIcon';

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Home' },
    { path: '/market', icon: MarketIcon, label: 'Market' },
    { path: '/progress', icon: ProgressIcon, label: 'Progress' },
    { path: '/learn', icon: LearnIcon, label: 'Learn' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <IconComponent size={24} isActive={active} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
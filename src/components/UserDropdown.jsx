// src/components/UserDropdown.jsx
// User dropdown with settings/preferences/logout options
// Rolls down like a carpet over Practice Mode badge

import { useState, useRef, useEffect } from 'react';

function UserDropdown({ userName, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button Card */}
      <div className="relative z-50">
        <button
        onClick={toggleDropdown}
        className="text-right hover:opacity-80 transition-opacity pb-1 border-b border-gray-300"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-dark">{userName}</span>
            <span className={`text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ▾
            </span>
          </div>
        </button>

        {/* Dropdown Menu - Rolls down like carpet */}
        <div
            className={`
                absolute top-full left-0 right-0
                bg-white rounded-xl
                shadow-xl overflow-hidden transition-all duration-300 z-50
                ${isOpen ? 'max-h-48' : 'max-h-0'}
            `}
            >
          {/* Settings - Disabled */}
          <button
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
          >
            <span>Settings</span>
          </button>

          {/* Preferences - Disabled */}
          <button
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
          >
            <span>Preferences</span>
          </button>

          {/* Log Out - Active */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-red-50 hover:text-danger transition-colors"
          >
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Practice Mode Badge - Under the dropdown */}
      <div className="flex items-center mt-2">
        <svg 
          className="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(6, 6)">
            <path 
              d="M 8 2 L 8 8 C 8 10.2 6.2 12 4 12 L 4 2 Z M 4 2 C 4 2 5.5 1 8 1 C 10.5 1 12 2 12 2 L 12 12 C 9.8 12 8 10.2 8 8 L 8 2 Z" 
              fill="#F59E0B"
            />
            <path 
              d="M 6 6 L 7 7.5 L 10 4.5" 
              stroke="#FEF3C7" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"
            />
          </g>
        </svg>
        <span className="text-xs sm:text-sm font-bold text-amber-900">
          Practice Mode
        </span>
      </div>
    </div>
  );
}

export default UserDropdown;
// src/components/Button.jsx
// Reusable button component with consistent brand styling
// Supports variants: primary, secondary, danger, success, ghost
// Supports sizes: sm, md, lg

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  // Base styles - applied to all buttons
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg focus:ring-primary disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
    secondary: 'bg-gray-200 text-dark hover:bg-gray-300 hover:shadow-md focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    danger: 'bg-danger text-white hover:bg-red-600 hover:shadow-lg focus:ring-danger disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
    success: 'bg-success text-white hover:bg-green-600 hover:shadow-lg focus:ring-success disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
    ghost: 'bg-transparent text-primary hover:bg-primary hover:bg-opacity-10 focus:ring-primary disabled:text-gray-400 disabled:cursor-not-allowed',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Combine all styles
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
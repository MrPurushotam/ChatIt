const Loader = ({ size = 'md', className = "", color= "#3189fc" }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };
  const spinnerSize = sizeClasses[size];
  return (
    <div className={className}>
      <div className={`spinner-container ${spinnerSize}`}>
        <svg className={`spinner w-8 h-8 sm:w-12 sm:h-12 `} viewBox="25 25 50 50">
          <circle
            className="spinner-circle"
            cx="50"
            cy="50"
            r="20"
            stroke={color}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default Loader
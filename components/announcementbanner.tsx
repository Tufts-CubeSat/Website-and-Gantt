import React from 'react';

interface AnnouncementBannerProps {
  badge?: string;
  message: string;
  
  /**
   * Optional shortened message for mobile devices
   * If not provided, the full message will be used
   */
  mobileMessage?: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  
  /**
   * Optional click handler for the banner
   */
  onClick?: () => void;
  className?: string;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  badge = 'Upcoming',
  message,
  mobileMessage,
  variant = 'blue',
  onClick,
  className = '',
}) => {
  // Color mappings for different variants
  const variantClasses = {
    blue: {
      bg: 'bg-blue-600 hover:bg-blue-700',
      badgeBg: 'bg-blue-800',
    },
    green: {
      bg: 'bg-green-600 hover:bg-green-700',
      badgeBg: 'bg-green-800',
    },
    yellow: {
      bg: 'bg-yellow-600 hover:bg-yellow-700',
      badgeBg: 'bg-yellow-800',
    },
    red: {
      bg: 'bg-red-600 hover:bg-red-700',
      badgeBg: 'bg-red-800',
    },
    purple: {
      bg: 'bg-purple-600 hover:bg-purple-700',
      badgeBg: 'bg-purple-800',
    },
    gray: {
      bg: 'bg-gray-600 hover:bg-gray-700',
      badgeBg: 'bg-gray-800',
    },
  };

  const colors = variantClasses[variant];

  return (
    <div
      className={`
        mb-6 
        overflow-hidden 
        rounded-lg 
        ${colors.bg}
        px-3 py-3 
        sm:px-4 sm:py-3
        shadow-lg 
        transition-all 
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
          {/* Badge */}
          <span
            className={`
              flex-shrink-0 
              rounded-lg 
              ${colors.badgeBg}
              px-2 py-1
              sm:px-2.5 sm:py-1.5
              text-[10px] 
              xs:text-xs
              sm:text-xs
              font-bold 
              uppercase 
              tracking-wider 
              text-white
              whitespace-nowrap
            `}
          >
            {badge}
          </span>

          {/* Message */}
          <p className="flex-1 min-w-0 font-medium text-white text-xs xs:text-sm sm:text-base">
            {mobileMessage ? (
              <>
                <span className="md:hidden block truncate">{mobileMessage}</span>
                <span className="hidden md:block">{message}</span>
              </>
            ) : (
              <span className="block truncate sm:truncate md:whitespace-normal">
                {message}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
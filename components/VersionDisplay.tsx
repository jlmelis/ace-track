import React from 'react';

interface VersionDisplayProps {
  version?: string;
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ version, className = '' }) => {
  // If version is not provided, try to get it from the global VERSION constant
  const displayVersion = version || (typeof window !== 'undefined' ? (window as any).APP_VERSION : 'v?.?.?');
  
  return (
    <div className={`text-center ${className}`}>
      <span className="text-[9px] text-brand-primary-200 uppercase tracking-[0.2em] font-bold">
        AceTrack {displayVersion}
      </span>
    </div>
  );
};

export default VersionDisplay;
import React from 'react';

interface VersionDisplayProps {
  version?: string;
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ version, className = '' }) => {
  // If version is not provided, show placeholder
  const displayVersion = version || '?.?.?';
  
  // Remove 'v' prefix if present for consistent display
  const versionNumber = displayVersion.startsWith('v') ? displayVersion.substring(1) : displayVersion;
  
  return (
    <div className={`text-center ${className}`}>
      <span className="text-[8px] text-slate-400 uppercase tracking-[0.1em]">
        v{versionNumber}
      </span>
    </div>
  );
};

export default VersionDisplay;
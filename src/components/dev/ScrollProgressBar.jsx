import React from "react";

const ScrollProgressBar = ({ progress = 0 }) => {
  // Convert progress to percentage string
  const progressValue = typeof progress === "number" ? `${progress}%` : progress;

  return (
    <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        style={{ width: progressValue }}
      />
    </div>
  );
};

export default ScrollProgressBar;


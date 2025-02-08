import React from "react";

interface SkeletonLoaderProps {
  type: "list" | "details";
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  return (
    <div className={`relative overflow-hidden ${type === "list" ? "space-y-6" : "space-y-4"}`}>
      {/* Diagonal Glow Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 opacity-20 animate-glow"></div>
      

      {/* List Skeleton */}
      {type === "list" &&
        [...Array(8)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 relative z-10">
            <div className="flex-1 space-y-2">
              <div className="h-7 bg-gray-100 rounded w-full relative overflow-hidden">
                <div className="skeleton-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-5/6 relative overflow-hidden">
                <div className="skeleton-shimmer"></div>
              </div>
            </div>
          </div>
        ))}

      {/* Details Skeleton */}
      {type === "details" && (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-6 relative z-10">
          {/* Top Section */}
          <div className="flex items-center space-x-6">
            {/* Square Placeholder (Left) */}
            <div className="w-40 h-52 bg-gray-200 rounded-lg relative overflow-hidden">
              <div className="skeleton-shimmer"></div>
            </div>

            {/* Text Skeletons (Right) */}
            <div className="flex-1 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-5 bg-gray-300 rounded w-full relative overflow-hidden">
                  <div className="skeleton-shimmer"></div>
                </div>
              ))}

              {/* Button Placeholder */}
              <div className="h-10 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                <div className="skeleton-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Chart Skeleton */}
          <div className="w-full bg-gray-200 p-4 rounded-lg relative overflow-hidden">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4 mx-auto relative overflow-hidden">
              <div className="skeleton-shimmer"></div>
            </div>
            <div className="flex items-end space-x-3 justify-center h-32">
              {[50, 80, 100, 60, 30].map((height, index) => (
                <div
                  key={index}
                  className="w-8 bg-gray-300 rounded-lg relative overflow-hidden"
                  style={{ height: `${height}%` }}
                >
                  <div className="skeleton-shimmer"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="w-full bg-gray-100 p-4 rounded-lg relative overflow-hidden">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 mx-auto relative overflow-hidden">
              <div className="skeleton-shimmer"></div>
            </div>
            <div className="w-full border border-gray-200 rounded-lg">
              {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center border-b border-gray-100 p-2">
                  {[...Array(4)].map((_, colIndex) => (
                    <div key={colIndex} className="h-6 bg-gray-200 rounded w-1/4 mx-2 relative overflow-hidden">
                      <div className="skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;

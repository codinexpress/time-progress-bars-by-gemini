
import React, { useState } from 'react';
import { FeedbackSectionProps, RatingCounts } from '../types';
import { HeartIcon, StarIcon } from './Icons'; // Import HeartIcon and StarIcon

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbackData,
  onLikeToggle,
  onRate,
  isLoading,
  error,
  appTheme,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const { likeCount, hasLiked, ratingCounts, userRating } = feedbackData;

  const calculateAverageRating = (counts: RatingCounts): { average: number; total: number } => {
    let totalRatingSum = 0;
    let totalRatingsCount = 0;
    for (let i = 1; i <= 5; i++) {
      const count = counts[i as keyof RatingCounts] || 0;
      totalRatingSum += i * count;
      totalRatingsCount += count;
    }
    return {
      average: totalRatingsCount > 0 ? totalRatingSum / totalRatingsCount : 0,
      total: totalRatingsCount,
    };
  };

  const { average, total: totalRatings } = calculateAverageRating(ratingCounts);

  const likeButtonClass = `p-2 rounded-full transition-colors duration-200 ease-in-out
    ${hasLiked
      ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;
  
  const starColor = appTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-500';
  // const starMutedColor = appTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'; // This variable was unused

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-800/30 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Like Section */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Enjoying the App?
        </h2>
        <button
          onClick={onLikeToggle}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-150 ease-out group focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-pressed={hasLiked}
          aria-label={hasLiked ? "Unlike the app" : "Like the app"}
        >
          <HeartIcon className={`w-7 h-7 sm:w-8 sm:h-8 ${likeButtonClass} group-hover:scale-110`} color={hasLiked ? (appTheme === 'dark' ? '#f43f5e' : '#ef4444') : (appTheme === 'dark' ? '#64748b' : '#94a3b8')} />
          <span className={`text-sm font-medium ${appTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {isLoading ? 'Updating...' : (likeCount.toLocaleString() + (hasLiked ? ' Liked!' : ' Likes'))}
          </span>
        </button>
      </div>

      {/* Rating Section */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Rate Your Experience
        </h2>
        <div className="flex justify-center items-center space-x-1 mb-2" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              disabled={isLoading}
              className="p-1.5 sm:p-2 rounded-full transition-transform duration-150 ease-out hover:scale-125 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <StarIcon
                className="w-6 h-6 sm:w-7 sm:h-7"
                color={appTheme === 'dark' ? '#facc15' : '#f59e0b'} // yellow-400 dark, amber-500 light
                filled={(hoverRating || userRating) >= star}
              />
            </button>
          ))}
        </div>
        {isLoading && <p className="text-xs text-slate-500 dark:text-slate-400">Submitting rating...</p>}
        {!isLoading && totalRatings > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average: {average.toFixed(1)}/5 ({totalRatings.toLocaleString()} rating{totalRatings === 1 ? '' : 's'})
          </p>
        )}
         {!isLoading && totalRatings === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Be the first to rate!
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;

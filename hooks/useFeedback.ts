
import { useState, useEffect, useCallback } from 'react';
import { 
  FeedbackData, RatingCounts, 
  VISITOR_COUNT_KEY, LIKE_COUNT_KEY, RATING_KEY_PREFIX,
  LOCAL_STORAGE_HAS_LIKED_KEY, LOCAL_STORAGE_USER_RATING_KEY 
} from '../types';
import { getValue, updateValue } from '../utils/apiUtils';

export const useFeedback = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    likeCount: 0,
    hasLiked: false,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    userRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFeedbackSystem = async () => {
      setIsLoading(true);
      setError(null);
      
      const initialVisitorCount = await getValue(VISITOR_COUNT_KEY);
      if (initialVisitorCount !== null) {
        const newVisitorCount = initialVisitorCount + 1;
        setVisitorCount(newVisitorCount);
        await updateValue(VISITOR_COUNT_KEY, newVisitorCount);
      }

      const storedLikeCount = await getValue(LIKE_COUNT_KEY);
      const storedHasLiked = localStorage.getItem(LOCAL_STORAGE_HAS_LIKED_KEY) === 'true';

      const newRatingCounts: RatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (let i = 1; i <= 5; i++) {
        const count = await getValue(`${RATING_KEY_PREFIX}${i}`);
        if (count !== null) {
          newRatingCounts[i as keyof RatingCounts] = count;
        }
      }
      const storedUserRating = parseInt(localStorage.getItem(LOCAL_STORAGE_USER_RATING_KEY) || '0', 10);

      setFeedbackData({
        likeCount: storedLikeCount ?? 0,
        hasLiked: storedHasLiked,
        ratingCounts: newRatingCounts,
        userRating: storedUserRating,
      });
      
      setIsLoading(false);
    };
    initFeedbackSystem();
  }, []);

  const handleLikeToggle = useCallback(async () => {
    const newHasLiked = !feedbackData.hasLiked;
    const newLikeCount = feedbackData.likeCount + (newHasLiked ? 1 : -1);

    setFeedbackData(prev => ({ ...prev, hasLiked: newHasLiked, likeCount: newLikeCount }));
    localStorage.setItem(LOCAL_STORAGE_HAS_LIKED_KEY, String(newHasLiked));
    
    // Optimistic UI update, then background sync
    const success = await updateValue(LIKE_COUNT_KEY, newLikeCount);
    if (!success) {
      setError("Failed to sync like count. Preference saved locally.");
    } else {
      setError(null);
    }
  }, [feedbackData]);

  const handleRate = useCallback(async (newRating: number) => {
    const oldRating = feedbackData.userRating;
    const newRatingCounts = { ...feedbackData.ratingCounts };
    
    // Optimistic update
    const tempRatingCounts = {...newRatingCounts};
    if(oldRating > 0 && oldRating !== newRating) tempRatingCounts[oldRating as keyof RatingCounts] = Math.max(0, tempRatingCounts[oldRating as keyof RatingCounts] -1);
    tempRatingCounts[newRating as keyof RatingCounts]++;
    
    setFeedbackData(prev => ({ ...prev, userRating: newRating, ratingCounts: tempRatingCounts }));
    localStorage.setItem(LOCAL_STORAGE_USER_RATING_KEY, String(newRating));

    let apiSuccess = true;
    if (oldRating > 0 && oldRating !== newRating) {
      newRatingCounts[oldRating as keyof RatingCounts] = Math.max(0, newRatingCounts[oldRating as keyof RatingCounts] - 1);
      if (!(await updateValue(`${RATING_KEY_PREFIX}${oldRating}`, newRatingCounts[oldRating as keyof RatingCounts]))) {
        apiSuccess = false;
      }
    }

    if (apiSuccess && oldRating !== newRating) {
        newRatingCounts[newRating as keyof RatingCounts]++;
        if (!(await updateValue(`${RATING_KEY_PREFIX}${newRating}`, newRatingCounts[newRating as keyof RatingCounts]))) {
            apiSuccess = false;
        }
    }

    if (!apiSuccess) {
      setError("Failed to sync rating. Preference saved locally.");
    } else {
      setError(null);
    }
  }, [feedbackData]);

  return {
    visitorCount,
    feedbackData,
    isLoading,
    error,
    handleLikeToggle,
    handleRate
  };
};

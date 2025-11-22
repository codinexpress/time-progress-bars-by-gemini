
import { useState, useEffect, useCallback } from 'react';
import { 
  FeedbackData, RatingCounts, 
  VISITOR_COUNT_KEY, LIKE_COUNT_KEY, RATING_KEY_PREFIX,
  LOCAL_STORAGE_HAS_LIKED_KEY, LOCAL_STORAGE_USER_RATING_KEY 
} from '../types';
import { getValue, updateValue } from '../utils/apiUtils';
import { getErrorMessage } from '../utils/errorUtils';

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
      
      try {
        const initialVisitorCount = await getValue(VISITOR_COUNT_KEY);
        if (initialVisitorCount !== null) {
          const newVisitorCount = initialVisitorCount + 1;
          setVisitorCount(newVisitorCount);
          // Fire and forget update for visitors to speed up load
          updateValue(VISITOR_COUNT_KEY, newVisitorCount).catch(e => console.warn("Failed to update visitor count:", e));
        }

        const storedLikeCount = await getValue(LIKE_COUNT_KEY);
        const storedHasLiked = localStorage.getItem(LOCAL_STORAGE_HAS_LIKED_KEY) === 'true';

        const newRatingCounts: RatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        // Fetch ratings in parallel for speed
        const ratingPromises = [1, 2, 3, 4, 5].map(i => getValue(`${RATING_KEY_PREFIX}${i}`).then(val => ({ i, val })));
        const ratingResults = await Promise.all(ratingPromises);
        
        ratingResults.forEach(({ i, val }) => {
          if (val !== null) {
             newRatingCounts[i as keyof RatingCounts] = val;
          }
        });

        const storedUserRating = parseInt(localStorage.getItem(LOCAL_STORAGE_USER_RATING_KEY) || '0', 10);

        setFeedbackData({
          likeCount: storedLikeCount ?? 0,
          hasLiked: storedHasLiked,
          ratingCounts: newRatingCounts,
          userRating: storedUserRating,
        });
      } catch (err) {
        console.error("Feedback init error:", err);
        setError(`Could not load community stats: ${getErrorMessage(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    initFeedbackSystem();
  }, []);

  const handleLikeToggle = useCallback(async () => {
    const newHasLiked = !feedbackData.hasLiked;
    const newLikeCount = feedbackData.likeCount + (newHasLiked ? 1 : -1);

    setFeedbackData(prev => ({ ...prev, hasLiked: newHasLiked, likeCount: newLikeCount }));
    localStorage.setItem(LOCAL_STORAGE_HAS_LIKED_KEY, String(newHasLiked));
    
    // Optimistic UI update, then background sync
    try {
        const success = await updateValue(LIKE_COUNT_KEY, newLikeCount);
        if (!success) {
            // We don't revert UI for likes to keep it snappy, but we warn
            setError("Sync warning: Like status saved locally, but server update failed.");
        } else {
            setError(null);
        }
    } catch (err) {
        setError(`Sync failed: ${getErrorMessage(err)}`);
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

    try {
        let apiSuccess = true;
        
        // Decrement old rating if exists
        if (oldRating > 0 && oldRating !== newRating) {
          newRatingCounts[oldRating as keyof RatingCounts] = Math.max(0, newRatingCounts[oldRating as keyof RatingCounts] - 1);
          const success = await updateValue(`${RATING_KEY_PREFIX}${oldRating}`, newRatingCounts[oldRating as keyof RatingCounts]);
          if (!success) apiSuccess = false;
        }

        // Increment new rating
        if (apiSuccess && oldRating !== newRating) {
            newRatingCounts[newRating as keyof RatingCounts]++;
            const success = await updateValue(`${RATING_KEY_PREFIX}${newRating}`, newRatingCounts[newRating as keyof RatingCounts]);
            if (!success) apiSuccess = false;
        }

        if (!apiSuccess) {
          setError("Server sync incomplete. Rating saved locally.");
        } else {
          setError(null);
        }
    } catch (err) {
        setError(`Rating sync failed: ${getErrorMessage(err)}`);
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

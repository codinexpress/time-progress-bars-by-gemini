import { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types';
import { getValue, updateValue, updateStringValue, getStringValue } from '../utils/apiUtils';
import { getErrorMessage } from '../utils/errorUtils';

const MAX_COMMENTS = 100;
const CURSOR_KEY = 'tf_chat_cursor_v5'; 
const MSG_KEY_PREFIX = 'tf_chat_msg_v5_';
const LOCAL_STORAGE_COMMENTS_KEY = 'timeflux_cached_comments_v5';

export const useComments = () => {
  // Initialize with locally cached comments for instant rendering
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore cache parse error
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('Syncing...');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Connecting to community feed...');
    
    try {
      const cursor = await getValue(CURSOR_KEY);
      const totalCount = cursor || 0;

      if (totalCount === 0) {
        setComments([]);
        localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify([]));
        setIsLoading(false);
        setStatusMessage('');
        return;
      }

      // Collect keys to fetch from newest to oldest
      const countToFetch = Math.min(totalCount, MAX_COMMENTS);
      const keysToFetch: string[] = [];

      for (let i = 0; i < countToFetch; i++) {
        const logicalIndex = totalCount - i;
        const slot = (logicalIndex - 1) % MAX_COMMENTS;
        keysToFetch.push(`${MSG_KEY_PREFIX}${slot}`);
      }

      // Fetch in true batches to avoid overwhelming the server
      const BATCH_SIZE = 5;
      const fetchedComments: Comment[] = [];
      
      for (let i = 0; i < keysToFetch.length; i += BATCH_SIZE) {
        setStatusMessage(`Syncing... (${Math.min(i + BATCH_SIZE, keysToFetch.length)}/${countToFetch})`);
        const batchKeys = keysToFetch.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batchKeys.map(k => getStringValue(k)));
        
        for (const res of batchResults) {
          if (res) {
            try {
              const parsed = JSON.parse(res);
              if (parsed && parsed.text && parsed.id) {
                // Deduplicate by ID
                if (!fetchedComments.some(c => c.id === parsed.id)) {
                  fetchedComments.push(parsed);
                }
              }
            } catch {
              console.warn("Corrupted or legacy comment slot found, skipping.");
            }
          }
        }
      }

      // Sort newest first
      fetchedComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setComments(fetchedComments);
      localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(fetchedComments));
      setStatusMessage('');
    } catch (err) {
      console.error("fetchComments error:", err);
      // Keep existing cached comments visible if sync fails
      setError(`Connection interrupted: ${getErrorMessage(err)}. Showing cached signals.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = async (name: string, text: string) => {
    if (isSubmitting) return false;
    const trimmedText = text.trim();
    if (!trimmedText) return false;

    setIsSubmitting(true);
    setError(null);

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      author: name.trim() || 'Anonymous',
      text: trimmedText,
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update and cache immediately
    setComments(prev => {
      const updated = [newComment, ...prev.filter(c => c.id !== newComment.id)];
      try {
        localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or unavailable
      }
      return updated;
    });

    try {
      // 1. Fetch current cursor with retry if null
      let currentCursor = await getValue(CURSOR_KEY);
      if (currentCursor === null) {
        await new Promise(r => setTimeout(r, 400));
        currentCursor = await getValue(CURSOR_KEY);
      }

      const cursorVal = currentCursor ?? 0;
      const newCursor = cursorVal + 1;
      const slot = (newCursor - 1) % MAX_COMMENTS;
      const key = `${MSG_KEY_PREFIX}${slot}`;
      
      // 2. Write payload with automatic chunking for long comments
      const successWrite = await updateStringValue(key, JSON.stringify(newComment));
      if (!successWrite) {
        throw new Error("Server failed to acknowledge write operation.");
      }

      // 3. Update cursor
      const successCursor = await updateValue(CURSOR_KEY, newCursor);
      if (!successCursor) {
        console.warn("Cursor write failed, comment payload was stored.");
      }

      return true;
    } catch (err) {
      console.error("postComment error:", err);
      const msg = getErrorMessage(err);
      setError(`Transmission warning: ${msg}. Comment retained in local feed.`);
      // Return true so the form input is cleared and the comment is preserved in local view
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    isLoading,
    statusMessage,
    error,
    isSubmitting,
    fetchComments,
    postComment
  };
};

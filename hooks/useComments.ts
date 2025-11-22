
import { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types';
import { getValue, updateValue, updateStringValue, getStringValue } from '../utils/apiUtils';
import { getErrorMessage } from '../utils/errorUtils';

const MAX_COMMENTS = 100;
const CURSOR_KEY = 'tf_chat_cursor_v5'; 
const MSG_KEY_PREFIX = 'tf_chat_msg_v5_';

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('Syncing...');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Syncing neural feed...');
    
    try {
      const cursor = await getValue(CURSOR_KEY);
      const totalCount = cursor || 0;

      if (totalCount === 0) {
        setComments([]);
        setIsLoading(false);
        setStatusMessage('');
        return;
      }

      const fetchPromises: Promise<string | null>[] = [];
      const countToFetch = Math.min(totalCount, MAX_COMMENTS);

      for (let i = 0; i < countToFetch; i++) {
        const logicalIndex = totalCount - i;
        const slot = (logicalIndex - 1) % MAX_COMMENTS;
        const key = `${MSG_KEY_PREFIX}${slot}`;
        fetchPromises.push(getStringValue(key));
      }

      const BATCH_SIZE = 10;
      const results: (string | null)[] = [];
      
      for (let i = 0; i < fetchPromises.length; i += BATCH_SIZE) {
        setStatusMessage(`Syncing... (${Math.min(i + BATCH_SIZE, fetchPromises.length)}/${countToFetch})`);
        const batch = fetchPromises.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        
        if (i + BATCH_SIZE < fetchPromises.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      const fetchedComments: Comment[] = [];
      results.forEach((res) => {
        if (res) {
          try {
            const parsed = JSON.parse(res);
            if (parsed && parsed.text) {
              fetchedComments.push(parsed);
            }
          } catch (e) {
            // Ignore corrupted slots - usually doesn't need a user alert
            console.warn("Corrupted comment slot found, skipping.");
          }
        }
      });

      fetchedComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setComments(fetchedComments);
      setStatusMessage('');
    } catch (err) {
      console.error("fetchComments error:", err);
      setError(`Connection disrupted: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = async (name: string, text: string) => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setError(null);

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      author: name.trim() || 'Anonymous',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Optimistic UI update
      setComments(prev => [newComment, ...prev]);

      const currentCursor = await getValue(CURSOR_KEY) || 0;
      const newCursor = currentCursor + 1;
      const slot = (newCursor - 1) % MAX_COMMENTS;
      const key = `${MSG_KEY_PREFIX}${slot}`;
      
      const successWrite = await updateStringValue(key, JSON.stringify(newComment));
      if (!successWrite) throw new Error("Server failed to acknowledge write operation.");

      await updateValue(CURSOR_KEY, newCursor);
      return true;
    } catch (err) {
      console.error("postComment error:", err);
      const msg = getErrorMessage(err);
      setError(`Transmission failed: ${msg}`);
      // Re-fetch to sync state if failed to ensure optimistic update is reverted if needed
      setTimeout(fetchComments, 1000);
      return false;
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

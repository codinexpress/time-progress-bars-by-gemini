
import React, { useState, useEffect, useCallback } from 'react';
import { Comment, Theme } from '../types';
import { getValue, updateValue, updateStringValue, getStringValue } from '../utils/apiUtils';

interface CommentSectionProps {
  appTheme: Theme;
}

// Circular Buffer Configuration
const MAX_COMMENTS = 100;
const CURSOR_KEY = 'tf_chat_cursor_v5'; 
const MSG_KEY_PREFIX = 'tf_chat_msg_v5_';

const formatCommentTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 5) return "just now";
  if (diffMinutes < 1) return `${diffSeconds}s ago`;
  if (diffHours < 1) return `${diffMinutes}m ago`;
  if (diffDays < 1) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CommentSection: React.FC<CommentSectionProps> = ({ appTheme }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('Syncing...');
  const [error, setError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Syncing neural feed...');
    
    try {
      // 1. Get the Global Cursor (Total comments ever posted)
      const cursor = await getValue(CURSOR_KEY);
      const totalCount = cursor || 0;

      if (totalCount === 0) {
        setComments([]);
        setIsLoading(false);
        setStatusMessage('');
        return;
      }

      // 2. Determine which slots to fetch (Last MAX_COMMENTS)
      const fetchPromises: Promise<string | null>[] = [];
      const countToFetch = Math.min(totalCount, MAX_COMMENTS);

      // We loop backwards from the current cursor to get latest first
      for (let i = 0; i < countToFetch; i++) {
        // The cursor points to the *last written* index (logically).
        const logicalIndex = totalCount - i;
        const slot = (logicalIndex - 1) % MAX_COMMENTS;
        const key = `${MSG_KEY_PREFIX}${slot}`;
        fetchPromises.push(getStringValue(key));
      }

      // 3. Fetch in Batches
      // Batching is crucial to avoid browser connection limits and network errors ("Failed to fetch")
      const BATCH_SIZE = 10;
      const results: (string | null)[] = [];
      
      for (let i = 0; i < fetchPromises.length; i += BATCH_SIZE) {
        setStatusMessage(`Syncing... (${Math.min(i + BATCH_SIZE, fetchPromises.length)}/${countToFetch})`);
        const batch = fetchPromises.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        
        // Small delay to yield to main thread and network stack
        if (i + BATCH_SIZE < fetchPromises.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      // 4. Parse and Filter
      const fetchedComments: Comment[] = [];
      results.forEach((res) => {
        if (res) {
          try {
            const parsed = JSON.parse(res);
            if (parsed && parsed.text) {
              fetchedComments.push(parsed);
            }
          } catch (e) {
            // Ignore corrupted slots
          }
        }
      });

      // Sort just in case, though the fetch order is roughly chronological reversed
      fetchedComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setComments(fetchedComments);
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve transmission.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      author: nameInput.trim() || 'Anonymous',
      text: commentInput.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Optimistic UI update
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');

      // 1. Get current cursor
      const currentCursor = await getValue(CURSOR_KEY) || 0;
      
      // 2. Calculate new slot
      const newCursor = currentCursor + 1;
      const slot = (newCursor - 1) % MAX_COMMENTS;
      
      // 3. Write Comment to its own key pair
      // Using updateStringValue which now handles safe Base64 encoding
      const key = `${MSG_KEY_PREFIX}${slot}`;
      const successWrite = await updateStringValue(key, JSON.stringify(newComment));
      
      if (!successWrite) throw new Error("Failed to uplink message. Network may be busy.");

      // 4. Update Cursor
      const successCursor = await updateValue(CURSOR_KEY, newCursor);
      
      if (!successCursor) console.warn("Cursor update failed, but comment might be saved.");

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transmission failed';
      setError(msg);
      // Revert optimistic update on hard fail
      // We delay this slightly to not jar the user immediately if it's a minor network blip
      setTimeout(fetchComments, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const inputClass = `w-full px-3 py-2 text-sm rounded-md border transition-colors outline-none
    ${appTheme === 'dark' 
      ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-sky-500 placeholder-slate-400' 
      : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500 placeholder-slate-400'}`;
  
  const buttonClass = `px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
    ${appTheme === 'dark' 
      ? 'bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-400 focus:ring-offset-slate-800 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed' 
      : 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500 focus:ring-offset-slate-100 disabled:bg-sky-300 disabled:text-slate-500 disabled:cursor-not-allowed'}`;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitComment} className="space-y-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 shadow">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 flex justify-between items-center">
          <span>Leave a Comment</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Max 100 (Rolling)</span>
        </h2>
        <div>
          <label htmlFor="commentAuthor" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Name (Optional)
          </label>
          <input
            type="text"
            id="commentAuthor"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className={inputClass}
            maxLength={40}
          />
        </div>
        <div>
          <label htmlFor="commentText" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Comment
          </label>
          <textarea
            id="commentText"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write your comment here..."
            rows={3}
            required
            className={`${inputClass} min-h-[60px]`}
            maxLength={500}
          />
          <div className="text-right text-[10px] text-slate-400 mt-1">
             {commentInput.length}/500
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 pt-1">
            {isSubmitting && <span className="text-xs text-slate-500 dark:text-slate-400">Broadcasting...</span>}
            <button type="submit" disabled={isSubmitting || !commentInput.trim()} className={buttonClass}>
             Post Comment
            </button>
        </div>
         {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
      </form>

      <div className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-2">
           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {comments.length > 0 ? `${comments.length} Comment${comments.length === 1 ? '' : 's'}` : 'Discussion'}
           </h3>
           {isLoading && <span className="text-xs text-sky-500 animate-pulse">{statusMessage}</span>}
           {!isLoading && !error && <button onClick={fetchComments} className="text-xs text-sky-500 hover:underline">Refresh</button>}
        </div>
        
        {!isLoading && comments.length === 0 && !error && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
            No signals detected. Be the first to broadcast.
          </div>
        )}
        
        <ul aria-live="polite" className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">
          {comments.map((comment) => (
            <li key={comment.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-700/30 shadow-sm border border-slate-200 dark:border-slate-600/50">
              <div className="flex justify-between items-start mb-1">
                <strong className="text-sm font-semibold text-sky-700 dark:text-sky-400 break-all">{comment.author}</strong>
                <time dateTime={comment.timestamp} className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                  {formatCommentTimestamp(comment.timestamp)}
                </time>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{comment.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommentSection;

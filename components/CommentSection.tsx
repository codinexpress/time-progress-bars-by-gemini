
import React, { useState } from 'react';
import { Theme } from '../types';
import { useComments } from '../hooks/useComments';

interface CommentSectionProps {
  appTheme: Theme;
}

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
  const { 
    comments, 
    isLoading, 
    statusMessage, 
    error, 
    isSubmitting, 
    fetchComments, 
    postComment 
  } = useComments();

  const [nameInput, setNameInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const success = await postComment(nameInput, commentInput);
    if (success) {
      setCommentInput('');
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

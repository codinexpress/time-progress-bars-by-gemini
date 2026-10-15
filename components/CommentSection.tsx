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

  const [nameInput, setNameInput] = useState<string>(() => {
    try {
      return localStorage.getItem('timeFlux_commentAuthor') || '';
    } catch {
      return '';
    }
  });
  const [commentInput, setCommentInput] = useState<string>('');
  const [postSuccess, setPostSuccess] = useState<boolean>(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = commentInput.trim();
    if (!trimmedText || isSubmitting) return;

    try {
      localStorage.setItem('timeFlux_commentAuthor', nameInput.trim());
    } catch {
      // Ignore
    }

    const success = await postComment(nameInput, trimmedText);
    if (success) {
      setCommentInput('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3500);
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
      {/* Security Disclaimer */}
      <section className="space-y-2 p-4 sm:p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
          Security Disclaimer
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed text-red-800 dark:text-red-300">
          The comment and feedback features in this application utilize a public, unsecured key-value store for demonstration purposes. 
          <strong> We do not guarantee the security, privacy, or persistence of any data you submit.</strong>
        </p>
        <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300">
          Please do NOT post any sensitive personal information, passwords, or private data.
        </p>
      </section>

      <form onSubmit={handleSubmitComment} className="space-y-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 shadow">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 flex justify-between items-center">
          <span>Leave a Comment</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Community Feed</span>
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
            placeholder="Your name or callsign"
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
            placeholder="Share your thoughts or observations about time..."
            rows={3}
            required
            className={`${inputClass} min-h-[60px]`}
            maxLength={500}
          />
          <div className="text-right text-[10px] text-slate-400 mt-1">
             {commentInput.length}/500
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
            <div>
              {postSuccess && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ✓ Signal broadcasted successfully!
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isSubmitting && <span className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">Broadcasting...</span>}
              <button type="submit" disabled={isSubmitting || !commentInput.trim()} className={buttonClass}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
        </div>
        {error && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400" role="alert">{error}</p>}
      </form>

      <div className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-2">
           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {comments.length > 0 ? `${comments.length} Comment${comments.length === 1 ? '' : 's'}` : 'Discussion'}
           </h3>
           <div className="flex items-center gap-3">
             {isLoading && <span className="text-xs text-sky-500 animate-pulse">{statusMessage}</span>}
             {!isLoading && <button type="button" onClick={fetchComments} className="text-xs text-sky-500 hover:underline">Refresh Feed</button>}
           </div>
        </div>
        
        {!isLoading && comments.length === 0 && !error && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
            No signals detected yet. Be the first to broadcast a comment.
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

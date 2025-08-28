
import React, { useState, useEffect, useCallback } from 'react';
import { Comment, CommentData, CommentSectionProps } from '../types';

const COMMENTS_API_BASE_URL = 'https://json.extendsclass.com/bin';
const COMMENTS_BIN_ID_STORAGE_KEY = 'temporalFluxCommentsBinId_v2'; // Versioned key

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

const CommentSection: React.FC<CommentSectionProps> = ({ apiKey, appTheme }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [binId, setBinId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleApiError = useCallback(async (response: Response, context: string): Promise<string> => {
    const status = response.status;
    const statusText = response.statusText || 'N/A';
    // Default user-facing message for unexpected responses
    let userFacingErrorMessage = `Error in ${context.toLowerCase()}: The server returned an unexpected response. Please try again later. (Code: ${status})`;
    // Detailed message for console logging
    let technicalDetailForLogging = `${context} (Status: ${status} ${statusText})`;

    try {
      // Attempt to parse response as JSON
      const errorData = await response.json();
      if (errorData && errorData.message) {
        // API returned JSON with a message field
        technicalDetailForLogging = `${context}: API Error Message: "${errorData.message}" (Status: ${status})`;
        userFacingErrorMessage = `${context}: ${errorData.message}`; // Use API's message if available
      } else {
        // API returned JSON but no 'message' field or unexpected structure
        const responsePreview = JSON.stringify(errorData);
        technicalDetailForLogging = `${context}: Received JSON response without 'message' field or with unexpected structure (Status: ${status}). Response: ${responsePreview.substring(0,200)}${responsePreview.length > 200 ? '...' : ''}`;
        userFacingErrorMessage = `Error in ${context.toLowerCase()}: Unexpected data format from server. (Code: ${status})`;
      }
    } catch (jsonError) {
      // JSON parsing failed, so response is not JSON (e.g., HTML, plain text)
      let responseBodyAsText = '';
      try {
        // Try to read the response body as text.
        // Note: response.text() consumes the body. If response.json() failed due to invalid syntax
        // (like encountering '<' in HTML), the body stream might be disturbed.
        // Robust handling might involve checking Content-Type first or cloning response.
        responseBodyAsText = await response.text();
        
        if (responseBodyAsText.trim().toLowerCase().startsWith('<!doctype html') || responseBodyAsText.trim().toLowerCase().startsWith('<html')) {
          // Response is HTML
          technicalDetailForLogging = `${context}: Server returned HTML (Status: ${status}). Preview: ${responseBodyAsText.substring(0, 250)}${responseBodyAsText.length > 250 ? '...' : ''}`;
          userFacingErrorMessage = `Error in ${context.toLowerCase()}: The comment service returned an HTML page. This might indicate an API key problem, rate limiting, or a service issue. (Code: ${status})`;
        } else {
          // Response is non-JSON, non-HTML text
          technicalDetailForLogging = `${context}: Server returned non-JSON text (Status: ${status}). Preview: ${responseBodyAsText.substring(0, 250)}${responseBodyAsText.length > 250 ? '...' : ''}`;
          userFacingErrorMessage = `Error in ${context.toLowerCase()}: The server sent an unexpected text response. (Code: ${status})`;
        }
      } catch (textReadError) {
        // Failed to read response body as text after JSON parsing failed
        technicalDetailForLogging = `${context}: Failed to read response body as text after JSON parsing failed. (Status: ${status}, JSON Parse Error: ${jsonError}, Text Read Error: ${textReadError})`;
        userFacingErrorMessage = `Error in ${context.toLowerCase()}: Failed to read error response from server. (Code: ${status})`;
      }
    }

    console.error('API Error Details:', technicalDetailForLogging, {
      requestContext: context,
      responseStatus: status,
      responseStatusText: statusText,
      responseHeaders: response.headers ? Object.fromEntries(response.headers.entries()) : 'N/A',
    });
    
    return userFacingErrorMessage; // Return the user-friendly message for UI display
  }, []);


  const createCommentsBin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(COMMENTS_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-key': apiKey, 
        },
        body: JSON.stringify({ comments: [] } as CommentData),
      });

      if (response.ok) {
        const newBinInfo = await response.json();
        if (newBinInfo.id) {
          localStorage.setItem(COMMENTS_BIN_ID_STORAGE_KEY, newBinInfo.id);
          setBinId(newBinInfo.id);
          setComments([]); 
        } else {
          throw new Error('Failed to create comments bin: No ID returned in successful response.');
        }
      } else {
        const errorMessage = await handleApiError(response, 'Failed to create comments bin');
        throw new Error(errorMessage);
      }
    } catch (err) {
      // handleApiError has already logged detailed technical info.
      // err.message here will be the user-facing message from handleApiError or other specific errors.
      const messageToDisplay = err instanceof Error ? err.message : 'An unknown error occurred while creating the comment section.';
      console.error(`User-facing error after attempting to create comments bin: ${messageToDisplay}`);
      setError(messageToDisplay);
      setComments([]); 
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, handleApiError]);

  const fetchComments = useCallback(async (currentBinId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${COMMENTS_API_BASE_URL}/${currentBinId}`);
      if (response.ok) {
        const data: CommentData = await response.json();
        setComments(Array.isArray(data.comments) ? data.comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      } else if (response.status === 404) {
        localStorage.removeItem(COMMENTS_BIN_ID_STORAGE_KEY);
        await createCommentsBin(); 
        return; 
      } else {
        const errorMessage = await handleApiError(response, 'Failed to fetch comments');
        throw new Error(errorMessage);
      }
    } catch (err) {
      const messageToDisplay = err instanceof Error ? err.message : 'An unknown error occurred while fetching comments.';
      console.error(`User-facing error after attempting to fetch comments: ${messageToDisplay}`);
      setError(messageToDisplay);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [createCommentsBin, handleApiError]);


  useEffect(() => {
    const storedBinId = localStorage.getItem(COMMENTS_BIN_ID_STORAGE_KEY);
    if (storedBinId) {
      setBinId(storedBinId);
      fetchComments(storedBinId);
    } else {
      createCommentsBin();
    }
  }, [fetchComments, createCommentsBin]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !binId || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      author: nameInput.trim() || 'Anonymous',
      text: commentInput.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const currentCommentsResponse = await fetch(`${COMMENTS_API_BASE_URL}/${binId}`);
      let existingComments: Comment[] = [];
      if (currentCommentsResponse.ok) {
          const data: CommentData = await currentCommentsResponse.json();
          existingComments = Array.isArray(data.comments) ? data.comments : [];
      } else if (currentCommentsResponse.status !== 404) { 
          const fetchErrMessage = await handleApiError(currentCommentsResponse, 'Failed to fetch current comments before update');
          throw new Error(fetchErrMessage);
      }
      
      const updatedComments = [newComment, ...existingComments]; 
      
      const response = await fetch(`${COMMENTS_API_BASE_URL}/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: updatedComments } as CommentData),
      });

      if (response.ok) {
        setComments(updatedComments.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setNameInput('');
        setCommentInput('');
      } else {
        const postErrMessage = await handleApiError(response, 'Failed to post comment');
        throw new Error(postErrMessage);
      }
    } catch (err) {
      const messageToDisplay = err instanceof Error ? err.message : 'An unknown error occurred while posting the comment.';
      console.error(`User-facing error after attempting to post comment: ${messageToDisplay}`);
      setError(messageToDisplay);
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


  if (isLoading && !comments.length && !binId) { 
    return <div className="text-center p-10 text-slate-500 dark:text-slate-400">Initializing comment section...</div>;
  }
   if (isLoading && !comments.length && binId) { 
    return <div className="text-center p-10 text-slate-500 dark:text-slate-400">Loading comments...</div>;
  }


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitComment} className="space-y-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 shadow">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave a Comment</h2>
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
            aria-label="Your name (optional)"
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
            aria-label="Your comment"
            aria-required="true"
          />
        </div>
        <div className="flex items-center justify-end space-x-3 pt-1">
            {isSubmitting && <span className="text-xs text-slate-500 dark:text-slate-400">Submitting...</span>}
            <button type="submit" disabled={!binId || isSubmitting || !commentInput.trim()} className={buttonClass}>
             Post Comment
            </button>
        </div>
         {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {comments.length > 0 ? `${comments.length} Comment${comments.length === 1 ? '' : 's'}` : (binId && !error ? 'No comments yet.' : (error ? 'Could not load comments.' : 'Comment section initializing...'))}
        </h3>
        {isLoading && comments.length > 0 && <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">Refreshing comments...</div>}
        {!isLoading && comments.length === 0 && !error && binId && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Be the first to comment!</p>
        )}
        
        <ul aria-live="polite" className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2  scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">
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

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ProgressItemConfig, AppSettings } from '../types';
import { 
  XMarkIcon, 
  CopyIcon, 
  CheckIcon, 
  ExternalLinkIcon, 
  ImageIcon, 
  RefreshIcon,
  TwitterXIcon,
  FacebookIcon,
  WhatsAppIcon,
  TelegramIcon,
  LinkedInIcon,
  RedditIcon
} from './Icons';
import { 
  getOgImageUrl, 
  getSocialShareLinks, 
  getPlatformDebuggerLinks,
  getUserTimezoneOffset, 
  formatUtcOffsetString, 
  formatUtcOffsetLabel,
  generateCacheBuster
} from '../utils/ogUtils';

interface ShareModalProps {
  config?: ProgressItemConfig | null;
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  config,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDebuggers, setShowDebuggers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // High-entropy cache buster (timestamp + random hex nonce)
  const [{ t: shareTimestamp, v: shareNonce }, setCacheBuster] = useState(() => generateCacheBuster());

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Refresh snapshot when modal opens or user triggers it
  const handleRefreshSnapshot = useCallback(() => {
    setIsRefreshing(true);
    setCacheBuster(generateCacheBuster());
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Get user local timezone offset
  const offsetMinutes = getUserTimezoneOffset();
  const tzOffsetString = formatUtcOffsetString(offsetMinutes);
  const tzLabel = formatUtcOffsetLabel(offsetMinutes);

  // Construct canonical shareable page link with timezone offset and cache-busting timestamp & nonce
  const deepLinkParams = new URLSearchParams();
  if (config) {
    deepLinkParams.set('item', config.id);
  }
  deepLinkParams.set('tz', tzOffsetString);
  deepLinkParams.set('t', String(shareTimestamp));
  deepLinkParams.set('v', shareNonce);

  const queryString = deepLinkParams.toString();
  const shareableUrl = `${origin}${currentPath}${queryString ? `?${queryString}` : ''}`;

  // Corresponding Open Graph image preview URL matching the exact parameters
  const ogImgUrl = getOgImageUrl({
    item: config?.id || null,
    mode: settings.visualizationMode,
    theme: settings.theme,
    tz: tzOffsetString,
    t: shareTimestamp,
    v: shareNonce,
  });

  const shareTitle = config 
    ? `${config.label} Progress - Time Flux`
    : 'Time Flux - Real-Time Existence Tracker';

  const shareText = config
    ? `Check out the real-time progress of ${config.label} on Time Flux!`
    : 'Track the flow of time in real-time across micro, cyclical, macro & mega scales!';

  const socialLinks = getSocialShareLinks({
    url: shareableUrl,
    title: shareTitle,
    text: shareText,
  });

  const debuggerLinks = getPlatformDebuggerLinks(shareableUrl);

  const snapshotDate = new Date(shareTimestamp);
  const snapshotFormatted = snapshotDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareableUrl,
        });
      } catch (err) {
        // User dismissed share sheet
      }
    }
  };

  const modalContent = (
    <div 
      id="share-modal-backdrop"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="share-modal-dialog"
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {config ? `Share ${config.label}` : 'Share Time Flux'}
              </h3>
              <p className="text-xs text-slate-400">
                Live Open Graph snapshot with instant cache-busting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshSnapshot}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-all ${
                isRefreshing ? 'rotate-180 text-sky-400' : ''
              }`}
              title="Refresh snapshot & generate new unique link"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live Open Graph Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Social Card Preview</span>
                <span className="text-[10px] font-mono text-slate-500 font-normal">
                  ({snapshotFormatted} • {tzLabel})
                </span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshSnapshot}
                  className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  title="Generate a brand-new live image snapshot"
                >
                  <RefreshIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Fresh Snapshot</span>
                </button>
                <a
                  href={ogImgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  title="View full resolution image"
                >
                  <span>Full View</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
            
            {/* Aspect 1.91:1 Card container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group">
              <img
                key={`${shareTimestamp}-${shareNonce}`}
                src={ogImgUrl}
                alt={shareTitle}
                className="w-full h-auto aspect-[1.91/1] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
              />
              <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-emerald-400 border border-slate-700/60 flex items-center gap-1.5 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Snapshot {tzLabel}</span>
              </div>
            </div>
          </div>

          {/* Single Primary Share Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Shareable Link
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Cache-Bust: Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 select-all transition-colors"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>Timezone: <strong className="text-slate-300 font-mono">{tzLabel}</strong></span>
              <span>Nonce: <strong className="text-slate-300 font-mono">#{shareNonce}</strong></span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Every link contains a fresh timestamp and unique nonce, preventing CDN / social media platform caching.
            </p>
          </div>

          {/* 1-Click Social Media Platforms */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Share to Platform
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-blue-400"
              >
                <FacebookIcon className="w-4 h-4 text-blue-500" />
                <span>Facebook</span>
              </a>

              <a
                href={socialLinks.x}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-white"
              >
                <TwitterXIcon className="w-3.5 h-3.5 text-slate-100" />
                <span>X / Twitter</span>
              </a>

              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-emerald-400"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-sky-400"
              >
                <TelegramIcon className="w-4 h-4 text-sky-400" />
                <span>Telegram</span>
              </a>

              <a
                href={socialLinks.reddit}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-orange-400"
              >
                <RedditIcon className="w-4 h-4 text-orange-500" />
                <span>Reddit</span>
              </a>

              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all hover:text-sky-300"
              >
                <LinkedInIcon className="w-4 h-4 text-sky-400" />
                <span>LinkedIn</span>
              </a>
            </div>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full mt-2.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>More sharing options...</span>
              </button>
            )}
          </div>

          {/* Platform Cache Invalidation Tools (Collapsible) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowDebuggers(!showDebuggers)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              <span>Platform Cache Debuggers &amp; Validators</span>
              <span className="text-[10px] text-sky-400 underline">
                {showDebuggers ? 'Hide Tools' : 'Show Scraper Tools'}
              </span>
            </button>

            {showDebuggers && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <p className="text-[11px] text-slate-400">
                  If a platform ever shows an old cached preview, click to force-scrape the new URL:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={debuggerLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>FB Debugger</span>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href={debuggerLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>LinkedIn Inspector</span>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href={debuggerLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>X Card Validator</span>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href={debuggerLinks.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Telegram Bot</span>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center text-xs text-slate-400">
          <span className="text-[11px]">Dynamic Open Graph cards powered by Time Flux</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ShareModal;

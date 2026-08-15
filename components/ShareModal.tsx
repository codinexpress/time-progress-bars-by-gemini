import React, { useState } from 'react';
import { ProgressItemConfig, AppSettings } from '../types';
import { 
  XMarkIcon, 
  CopyIcon, 
  CheckIcon, 
  ExternalLinkIcon, 
  ImageIcon, 
  TwitterXIcon 
} from './Icons';
import { getOgImageUrl, getSocialShareLinks } from '../utils/ogUtils';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImgLink, setCopiedImgLink] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Construct deep link URL
  const deepLinkParams = new URLSearchParams();
  if (config) {
    deepLinkParams.set('item', config.id);
  }
  const queryString = deepLinkParams.toString();
  const shareableUrl = `${origin}${currentPath}${queryString ? `?${queryString}` : ''}`;

  // Construct OG Image URL
  const ogImgRelative = getOgImageUrl({
    item: config?.id || null,
    mode: settings.visualizationMode,
    theme: settings.theme,
  });
  const ogImgAbsolute = `${origin}${ogImgRelative}`;

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyImgLink = async () => {
    try {
      await navigator.clipboard.writeText(ogImgAbsolute);
      setCopiedImgLink(true);
      setTimeout(() => setCopiedImgLink(false), 2500);
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
        // User cancelled or share failed
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {config ? `Share ${config.label} Card` : 'Share Time Flux'}
              </h3>
              <p className="text-xs text-slate-400">
                Open Graph social media card & deep link preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live Open Graph Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Social Media Card Preview (1200 × 630)
              </span>
              <a
                href={ogImgRelative}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <span>View Full Resolution</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
            
            {/* Aspect 1.91:1 Card container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-inner group">
              <img
                src={ogImgRelative}
                alt={shareTitle}
                className="w-full h-auto aspect-[1.91/1] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-emerald-400 border border-slate-700/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Vercel Edge Function
              </div>
            </div>
          </div>

          {/* Share Links & Direct Copy Actions */}
          <div className="space-y-3">
            {/* Deep Link URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Direct Deep Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                  }`}
                >
                  {copiedLink ? (
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
            </div>

            {/* Direct OG Image Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Open Graph Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={ogImgAbsolute}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyImgLink}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                    copiedImgLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copiedImgLink ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy Image URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click Social Media Platforms */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Share directly to Social Media
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={socialLinks.x}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors"
              >
                <TwitterXIcon className="w-3.5 h-3.5 text-slate-100" />
                <span>X / Twitter</span>
              </a>

              <a
                href={socialLinks.reddit}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white">r/</span>
                <span>Reddit</span>
              </a>

              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="text-sky-400 text-xs">✈</span>
                <span>Telegram</span>
              </a>

              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="text-emerald-400 text-xs">💬</span>
                <span>WhatsApp</span>
              </a>
            </div>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full mt-2.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                More share options...
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center text-xs text-slate-400">
          <span>Supported platforms: Twitter/X, Discord, Slack, iMessage, Facebook, LinkedIn</span>
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
};

export default ShareModal;

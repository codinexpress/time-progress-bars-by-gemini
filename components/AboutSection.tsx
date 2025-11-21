
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4 text-slate-700 dark:text-slate-300">
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">About Time Flux</h2>
        <p className="leading-relaxed">
          Time Flux is a conceptual visualization tool designed to help you perceive the flow of existence across various scales. 
          From the fleeting millisecond to the span of a human life, this application breaks down time into tangible metrics.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-2">
          Made by Ireneo and the cool G.
          <br />
          Inspired by "Progress Bar Of The Year" page from Facebook.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Smart Pixel Visualization</h3>
        <p className="leading-relaxed">
          In the <strong>Pixel</strong> view mode, the grid is not just random dots. It adapts intelligently to the time unit being displayed to give you a concrete sense of scale:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2 text-sm sm:text-base bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <li><span className="font-semibold text-sky-600 dark:text-sky-400">Minute:</span> 60 pixels, where each pixel represents exactly <strong>1 second</strong>.</li>
          <li><span className="font-semibold text-sky-600 dark:text-sky-400">Hour:</span> 60 pixels, where each pixel represents <strong>1 minute</strong>.</li>
          <li><span className="font-semibold text-sky-600 dark:text-sky-400">Day:</span> 24 pixels, where each pixel represents <strong>1 hour</strong>.</li>
          <li><span className="font-semibold text-sky-600 dark:text-sky-400">Week:</span> 7 pixels, where each pixel represents <strong>1 day</strong>.</li>
          <li><span className="font-semibold text-sky-600 dark:text-sky-400">Year:</span> ~365 pixels, where each pixel represents <strong>1 day</strong>.</li>
        </ul>
        <p className="text-sm italic opacity-80">
          Look for the legend below the grid in Pixel mode to see exactly what each block represents.
        </p>
      </section>

      <section className="space-y-3 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
          Security Disclaimer
        </h3>
        <p className="text-sm leading-relaxed text-red-800 dark:text-red-300">
          The comment and feedback features in this application utilize a public, unsecured key-value store for demonstration purposes. 
          <strong>We do not guarantee the security, privacy, or persistence of any data you submit.</strong> 
        </p>
        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mt-2">
          Please do NOT post any sensitive personal information, passwords, or private data.
        </p>
      </section>
    </div>
  );
};

export default AboutSection;

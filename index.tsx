
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Add global error handlers to catch and log "uncaught" issues more descriptively
window.addEventListener('unhandledrejection', (event) => {
  console.error('Context: Unhandled Promise Rejection');
  console.error('Reason:', event.reason);
  // Optional: Prevent default if you want to suppress standard browser logging, but usually better to keep it.
});

window.addEventListener('error', (event) => {
  console.error('Context: Uncaught Runtime Error');
  console.error('Message:', event.message);
  console.error('Source:', event.filename, 'Line:', event.lineno, 'Col:', event.colno);
  console.error('Error Object:', event.error);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical: Could not find root element 'root' to mount the application.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

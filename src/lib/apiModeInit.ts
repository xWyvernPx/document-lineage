// Force real API mode on app startup
// This ensures we're using the real AWS API by default

const initializeApiMode = () => {
  // Only set if not already explicitly set
  if (!localStorage.getItem('api-mode')) {
    localStorage.setItem('api-mode', 'real');
    console.log('[API Mode] Initialized to real mode');
  } else {
    console.log('[API Mode] Already set to:', localStorage.getItem('api-mode'));
  }
};

// Call immediately when this module is loaded
initializeApiMode();

export { initializeApiMode };

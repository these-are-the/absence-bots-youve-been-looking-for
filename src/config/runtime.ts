// Runtime configuration for dynamic features
export const isStaticBuild = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-export';
export const isServerSide = typeof window === 'undefined';

export const config = {
  // API routes are disabled in static builds
  apiEnabled: !isStaticBuild && isServerSide,
  
  // Slack integration is disabled in static builds or when tokens are missing
  slackEnabled: !isStaticBuild && 
    !!process.env.SLACK_BOT_TOKEN && 
    !!process.env.SLACK_SIGNING_SECRET,
    
  // Base URL for API calls (empty for static builds)
  apiBaseUrl: isStaticBuild ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

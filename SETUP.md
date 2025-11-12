# VacayBot Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Slack credentials.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   This starts the Next.js app on `http://localhost:3000`

4. **Run the Slack bot (in a separate terminal):**
   ```bash
   npm run slack
   ```
   This starts the Slack bot on port 3001 (or PORT from .env)

## Slack App Configuration

### Required Slack App Permissions (Scopes)

**Bot Token Scopes:**
- `app_mentions:read` - Read mentions
- `channels:history` - View messages in channels
- `chat:write` - Send messages
- `commands` - Add slash commands
- `users:read` - View people in workspace
- `users:read.email` - View email addresses
- `im:write` - Send direct messages
- `im:read` - View direct messages

**User Token Scopes:**
- None required for basic functionality

### Required Slack Features

1. **Slash Commands:**
   - `/vacation` - Opens vacation request form

2. **Shortcuts:**
   - Global shortcut: `request_absence` - Opens absence request form

3. **Home Tab:**
   - Enable Home Tab in your Slack app settings

4. **Socket Mode:**
   - Enable Socket Mode in your Slack app settings
   - Generate an App-Level Token with `connections:write` scope
   - Add this token to your `.env` as `SLACK_APP_TOKEN`

### Event Subscriptions

If not using Socket Mode, configure these events:
- `app_home_opened` - When user opens the app home tab
- `app_mention` - When bot is mentioned

## Environment Variables

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_APP_TOKEN=xapp-your-app-token  # For Socket Mode

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3001
```

## Development Workflow

1. Start Next.js dev server: `npm run dev`
2. Start Slack bot: `npm run slack`
3. Test in Slack by typing `/vacation` or clicking the button in the Home tab
4. The webapp will open with the form pre-filled based on Slack context

## Production Deployment

1. Build the Next.js app:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Deploy Next.js app (Vercel, Railway, etc.)

4. Run Slack bot as a service (PM2, systemd, etc.)

5. Update `NEXT_PUBLIC_APP_URL` to your production URL

6. Update Slack app settings with production URLs if not using Socket Mode

## Troubleshooting

### Slack bot not responding
- Check that `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` are correct
- Verify Socket Mode is enabled if using `SLACK_APP_TOKEN`
- Check bot logs for errors

### Webapp not loading state from Slack
- Verify `NEXT_PUBLIC_APP_URL` matches your actual URL
- Check browser console for errors
- Verify the state parameter is being passed correctly in the URL

### Language not detected
- Check user's Slack locale settings
- Verify language translations exist in `src/lib/i18n/translations/`

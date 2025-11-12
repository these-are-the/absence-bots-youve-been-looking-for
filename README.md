# VacayBot

A modern vacation and absence management system with Slack integration, featuring a Typeform-style interface.

## Features

- 🎨 Typeform-style interactive UI
- 🌍 Multi-language support (English, Slovenian, German)
- 🏢 Multi-office support (Ljubljana, Munich)
- 💬 Slack integration with stateless flows
- 📅 Multiple absence types
- ✅ Manager approval workflow
- 📊 REST API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Slack workspace with app permissions

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Slack credentials:
```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_APP_TOKEN=xapp-your-app-token (for Socket Mode)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the Next.js development server:
```bash
npm run dev
```

Run the Slack bot (in a separate terminal):
```bash
npm run slack
```

The webapp will be available at `http://localhost:3000` and the Slack bot will connect via Socket Mode.

## Architecture

### Frontend
- Next.js 14 with App Router
- Typeform-style UI components
- Framer Motion for animations
- Tailwind CSS for styling
- i18n for multi-language support

### Backend
- Next.js API routes
- Stateless flow handlers for Slack integration
- RESTful API endpoints

### Slack Integration
- Slack Bolt SDK
- Socket Mode support
- Interactive modals and buttons
- Home tab interface

## API Endpoints

- `POST /api/absences` - Create absence request
- `GET /api/absences` - List absence requests (with filters)
- `GET /api/absences/[id]` - Get specific absence request
- `PATCH /api/absences/[id]` - Update absence request
- `DELETE /api/absences/[id]` - Cancel absence request
- `GET /api/outOfOffice/department/[department]` - Get absences by department
- `GET /api/outOfOffice/manager/[managerEmail]` - Get absences by manager
- `GET /api/outOfOffice/user/[email]` - Get absences by user

## Slack Commands

- `/vacation` - Open vacation request form

## Project Structure

```
VacayBot/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   └── page.tsx     # Main page
│   ├── components/      # React components
│   ├── config/          # Configuration files
│   ├── lib/             # Utility libraries
│   │   ├── i18n/       # Internationalization
│   │   └── statelessFlow.ts
│   ├── slack/           # Slack bot code
│   └── types/           # TypeScript types
├── FEATURES.md          # Feature documentation
└── package.json
```

## License

MIT

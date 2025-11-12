# VacayBot Deployment Guide

## Current Architecture Analysis

Your project consists of:
- **Next.js 14 web app** (Typeform-style UI)
- **Slack Bot** (using Slack Bolt SDK)
- **RxDB** (client-side only, IndexedDB via Dexie)
- **Next.js API routes** (mostly for external integrations)

## Deployment Options (Ranked by Simplicity & Cost)

### 🥇 Option 1: Google Cloud Run (NEW - Excellent Choice!)

**Best for:** Cost-effective, scalable containerized deployment

**Pros:**
- ✅ **Scale to zero** - Pay only when in use (perfect for cost savings)
- ✅ **Full Node.js runtime** - Next.js and Slack Bolt SDK work perfectly
- ✅ **Container-based** - Deploy both web app + bot together or separately
- ✅ **Scheduled scaling** - Keep instances warm during business hours
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **HTTPS included** - Automatic SSL certificates
- ✅ **Generous free tier** - 2 million requests/month free
- ✅ **Cold start mitigation** - Min instances option to keep warm

**Cons:**
- ⚠️ Cold start latency (~1-3 seconds) if scaled to zero
- ⚠️ Need to containerize (Docker)
- ⚠️ Slack bot needs webhook mode (not Socket Mode) OR use Cloud Scheduler to keep warm

**Cost:** 
- **Free tier:** 2M requests/month, 360K GB-seconds, 180K vCPU-seconds
- **After free:** ~$0.40 per million requests + $0.00002400 per GB-second + $0.0000100 per vCPU-second
- **Estimated:** $0-10/month for typical usage (scales to zero when idle)

**Perfect For:**
- ✅ Cost-conscious deployments
- ✅ Business hours usage (can schedule warm-up)
- ✅ Both Next.js and Slack bot in containers

---

### 🥈 Option 2: Vercel (Recommended - Easiest)

**Best for:** Quick deployment with minimal changes

**Pros:**
- ✅ Zero-config Next.js deployment
- ✅ Free tier: 100GB bandwidth, unlimited requests
- ✅ Automatic HTTPS, CDN, preview deployments
- ✅ Serverless functions for API routes
- ✅ Built-in environment variables

**Cons:**
- ⚠️ Slack bot needs separate deployment (see below)
- ⚠️ Serverless functions have 10s timeout (free), 60s (pro)

**Cost:** Free tier → $20/mo (Pro) for production

**Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Slack Bot Deployment:** Deploy separately to Railway/Render (see Option 2)

---

### 🥉 Option 3: Railway (Best for Full-Stack)

**Best for:** Running both web app + Slack bot together

**Pros:**
- ✅ Full Node.js runtime (no limitations)
- ✅ Can run Next.js + Slack bot in same process
- ✅ Free tier: $5 credit/month
- ✅ Simple deployment (GitHub integration)
- ✅ Persistent processes (perfect for Slack bot)

**Cons:**
- ⚠️ Slightly more expensive than Cloud Run free tier
- ⚠️ Need to configure build/start commands

**Cost:** ~$5-10/month (after free credit)

**Setup:**
1. Connect GitHub repo to Railway
2. Add environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start` (for Next.js) + `npm run slack` (separate service)

**Recommended Architecture:**
- **Service 1:** Next.js web app (`npm start`)
- **Service 2:** Slack bot (`npm run slack`)

---

### Option 4: Render

**Best for:** Similar to Railway, good free tier

**Pros:**
- ✅ Free tier available (with limitations)
- ✅ Full Node.js runtime
- ✅ Auto-deploy from GitHub
- ✅ Can run multiple services

**Cons:**
- ⚠️ Free tier spins down after inactivity (15 min)
- ⚠️ Slower cold starts

**Cost:** Free → $7/month (Starter)

**Setup:** Similar to Railway

---

### Option 5: Fly.io

**Best for:** Global edge deployment, Docker-based

**Pros:**
- ✅ Global edge network
- ✅ Docker-based (more control)
- ✅ Free tier: 3 shared VMs
- ✅ Good performance

**Cons:**
- ⚠️ Requires Docker knowledge
- ⚠️ More complex setup

**Cost:** Free tier → ~$5-10/month

---

## Google Cloud Run Deep Dive

### Architecture Options

#### Option A: Single Container (Both Services)

**Structure:**
```
Dockerfile
├── Next.js web app (port 3000)
└── Slack bot (port 3001)
```

**Pros:**
- ✅ Single deployment
- ✅ Shared environment variables
- ✅ Lower cost (one container)

**Cons:**
- ⚠️ Both scale together (may waste resources)
- ⚠️ More complex Dockerfile

#### Option B: Separate Containers (Recommended)

**Structure:**
```
Service 1: Next.js web app
Service 2: Slack bot
```

**Pros:**
- ✅ Independent scaling
- ✅ Can scale bot to zero when not needed
- ✅ Cleaner separation
- ✅ Better resource utilization

**Cons:**
- ⚠️ Two deployments to manage

---

### Cloud Run Setup Guide

#### Step 1: Create Dockerfile for Next.js

```dockerfile
# Dockerfile.webapp
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Cloud Run
  reactStrictMode: true,
}

module.exports = nextConfig
```

#### Step 2: Create Dockerfile for Slack Bot

```dockerfile
# Dockerfile.slackbot
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY src/slack ./src/slack
COPY src/config ./src/config
COPY src/lib ./src/lib
COPY src/types ./src/types
COPY tsconfig.json ./

# Build TypeScript
RUN npm install -g tsx
RUN npx tsc --project tsconfig.json || true

EXPOSE 3001

ENV PORT 3001
CMD ["tsx", "src/slack/index.ts"]
```

#### Step 3: Deploy to Cloud Run

**Deploy Web App:**
```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/vacaybot-webapp

# Deploy
gcloud run deploy vacaybot-webapp \
  --image gcr.io/YOUR_PROJECT/vacaybot-webapp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://vacaybot-webapp-xxx.run.app
```

**Deploy Slack Bot:**
```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/vacaybot-slackbot

# Deploy with min instances during business hours
gcloud run deploy vacaybot-slackbot \
  --image gcr.io/YOUR_PROJECT/vacaybot-slackbot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --min-instances 0 \
  --max-instances 5 \
  --memory 256Mi \
  --cpu 1 \
  --set-env-vars SLACK_BOT_TOKEN=xxx,SLACK_SIGNING_SECRET=xxx,SLACK_APP_TOKEN=xxx
```

#### Step 4: Set Up Scheduled Scaling (Keep Bot Warm)

**Option A: Cloud Scheduler (Recommended)**

```bash
# Create a job to ping the bot every 5 minutes during business hours
gcloud scheduler jobs create http keep-slackbot-warm \
  --schedule="*/5 9-17 * * 1-5" \
  --uri="https://vacaybot-slackbot-xxx.run.app/health" \
  --http-method=GET \
  --time-zone="America/New_York"
```

**Add health check endpoint to Slack bot:**
```typescript
// src/slack/index.ts
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Option B: Min Instances (Always Warm)**

```bash
# Keep at least 1 instance running during business hours
gcloud run services update vacaybot-slackbot \
  --min-instances 1 \
  --region us-central1
```

**Cost:** ~$5-10/month for 1 always-on instance (256MB)

---

### Cloud Run Cost Optimization

#### Strategy 1: Scale to Zero + Scheduled Warm-up

**Web App:**
- Min instances: 0
- Max instances: 10
- Cloud Scheduler: Ping every 5 min during business hours (9 AM - 5 PM)

**Slack Bot:**
- Min instances: 0
- Max instances: 5
- Cloud Scheduler: Ping every 5 min during business hours

**Cost:** ~$0-5/month (mostly free tier)

#### Strategy 2: Always-On During Business Hours

**Web App:**
- Min instances: 0 (scale to zero at night)

**Slack Bot:**
- Min instances: 1 (9 AM - 5 PM weekdays)
- Use Cloud Scheduler to scale up/down

**Cost:** ~$5-10/month

#### Strategy 3: Hybrid Approach

**Web App:**
- Scale to zero (users can wait 1-2s for cold start)

**Slack Bot:**
- Min instances: 1 during business hours
- Scale to zero at night/weekends

**Cost:** ~$3-8/month

---

### Slack Bot Considerations on Cloud Run

#### Option 1: Webhook Mode (Recommended)

**Pros:**
- ✅ No persistent connection needed
- ✅ Can scale to zero
- ✅ Stateless (perfect for Cloud Run)

**Setup:**
```typescript
// src/slack/index.ts
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // Remove socketMode and appToken
  processBeforeResponse: true, // Important for Cloud Run
});
```

**Slack App Settings:**
- Set Request URL: `https://vacaybot-slackbot-xxx.run.app/slack/events`
- Remove Socket Mode

#### Option 2: Socket Mode + Min Instances

**Pros:**
- ✅ Simpler setup (no webhook config)
- ✅ Works with current code

**Cons:**
- ⚠️ Need min instances = 1 (always-on cost)
- ⚠️ Can't scale to zero

**Cost:** ~$5-10/month for always-on instance

---

### Cloud Run vs Other Options

| Feature | Cloud Run | Vercel | Railway |
|---------|-----------|--------|---------|
| **Cost (idle)** | $0 (scale to zero) | $0 | $5-10/mo |
| **Next.js Support** | ✅ Full | ✅ Native | ✅ Full |
| **Slack Bot** | ✅ Full | ❌ Separate | ✅ Full |
| **Cold Starts** | 1-3s | <100ms | None |
| **Scaling** | Auto | Auto | Auto |
| **Free Tier** | 2M requests | Generous | $5 credit |
| **Docker Required** | ✅ Yes | ❌ No | ❌ No |

---

### Recommended Cloud Run Setup

**For Cost Optimization:**

1. **Web App:**
   - Deploy to Cloud Run
   - Min instances: 0
   - Cloud Scheduler: Ping during business hours (optional)

2. **Slack Bot:**
   - Deploy to Cloud Run
   - Use Webhook Mode (not Socket Mode)
   - Min instances: 0
   - Cloud Scheduler: Ping every 5 min during business hours

3. **Total Cost:** ~$0-5/month (mostly free tier)

**For Performance:**

1. **Web App:**
   - Min instances: 0 (acceptable cold start)

2. **Slack Bot:**
   - Min instances: 1 (always responsive)
   - Or use Webhook Mode + scheduled warm-up

3. **Total Cost:** ~$5-10/month

---

## Quick Start: Deploy to Cloud Run

### Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
```

### Deploy Script

```bash
#!/bin/bash
# deploy.sh

PROJECT_ID="your-project-id"
REGION="us-central1"

# Build and deploy web app
gcloud builds submit --tag gcr.io/$PROJECT_ID/vacaybot-webapp
gcloud run deploy vacaybot-webapp \
  --image gcr.io/$PROJECT_ID/vacaybot-webapp \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --min-instances 0 \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://vacaybot-webapp-xxx.run.app

# Build and deploy Slack bot
gcloud builds submit --tag gcr.io/$PROJECT_ID/vacaybot-slackbot
gcloud run deploy vacaybot-slackbot \
  --image gcr.io/$PROJECT_ID/vacaybot-slackbot \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3001 \
  --min-instances 0 \
  --set-env-vars SLACK_BOT_TOKEN=xxx,SLACK_SIGNING_SECRET=xxx

# Set up scheduled warm-up (optional)
gcloud scheduler jobs create http keep-slackbot-warm \
  --schedule="*/5 9-17 * * 1-5" \
  --uri="https://vacaybot-slackbot-xxx.run.app/health" \
  --http-method=GET
```

---

## Summary

**Best Option: Google Cloud Run** 🎯

- ✅ **Cost:** $0-5/month (scale to zero)
- ✅ **Performance:** Good (1-3s cold start, mitigated with scheduling)
- ✅ **Flexibility:** Full Node.js runtime
- ✅ **Scaling:** Auto-scales, can schedule warm-up
- ✅ **Both services:** Can deploy together or separately

**Setup Complexity:** Medium (need Docker)

**Recommended Setup:**
- Web App: Cloud Run (scale to zero)
- Slack Bot: Cloud Run (webhook mode + scheduled warm-up)
- Total Cost: ~$0-5/month

---

## Next Steps

1. ✅ Set up Google Cloud project
2. ✅ Create Dockerfiles
3. ✅ Deploy to Cloud Run
4. ✅ Set up Cloud Scheduler for warm-up
5. ✅ Configure Slack webhook mode
6. ✅ Test end-to-end

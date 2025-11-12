/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
  },
}

module.exports = nextConfig

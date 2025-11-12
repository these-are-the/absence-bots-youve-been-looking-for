import { App } from '@slack/bolt';
import { config } from '@/config/runtime';
import { absenceTypes, AbsenceType } from '@/config/absenceTypes';
import { offices, Office } from '@/config/offices';
import { t, Language } from '@/lib/i18n';
import { encodeFlowState, decodeFlowState, FlowState } from '@/lib/statelessFlow';
import { registerSlackActions } from './actions';

// Only initialize Slack app if enabled
let app: App | null = null;

if (config.slackEnabled) {
  if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
    console.warn('Slack tokens missing - Slack integration disabled');
  } else {
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: !!process.env.SLACK_APP_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    // Detect language from user locale
    function getUserLanguage(userLocale?: string): Language {
      if (!userLocale) return 'en';
      if (userLocale.startsWith('sl')) return 'sl';
      if (userLocale.startsWith('de')) return 'de';
      return 'en';
    }

    // Get webapp URL with state
    function getWebappUrl(state: FlowState, language: Language): string {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const encoded = encodeFlowState({ ...state, language });
      return `${baseUrl}/?state=${encoded}&lang=${language}`;
    }

    // Handle slash command
    app.command('/vacation', async ({ command, ack, respond, client }) => {
      await ack();

      const language = getUserLanguage(command.user_id ? (await client.users.info({ user: command.user_id })).user?.locale : undefined);
      
      const state: FlowState = {
        step: 'type',
        data: {},
        language,
      };

      const webappUrl = getWebappUrl(state, language);

      await respond({
        text: t('absence.title', language),
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${t('absence.title', language)}*\n${t('absence.selectType', language)}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: t('common.next', language),
                },
                url: webappUrl,
                style: 'primary',
              },
            ],
          },
        ],
      });
    });

    // Handle button clicks
    app.action('open_absence_form', async ({ ack, action, body, client }) => {
      await ack();

      if (!('user' in body) || !body.user) return;

      const userId = body.user.id;
      const userInfo = await client.users.info({ user: userId });
      const language = getUserLanguage(userInfo.user?.locale);

      const state: FlowState = {
        step: 'type',
        data: { userId, userEmail: userInfo.user?.profile?.email || '' },
        language,
      };

      const webappUrl = getWebappUrl(state, language);

      await client.views.open({
        trigger_id: (body as any).trigger_id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: t('absence.title', language),
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${t('absence.title', language)}*\n\n${t('absence.selectType', language)}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: t('common.next', language),
                  },
                  url: webappUrl,
                  style: 'primary',
                },
              ],
            },
          ],
        },
      });
    });

    // Handle home tab
    app.event('app_home_opened', async ({ event, client }) => {
      if (event.type !== 'app_home_opened') return;

      const userId = event.user;
      const userInfo = await client.users.info({ user: userId });
      const language = getUserLanguage(userInfo.user?.locale);

      try {
        await client.views.publish({
          user_id: userId,
          view: {
            type: 'home',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: t('absence.title', language),
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*${t('absence.title', language)}*\n\n${t('absence.selectType', language)}`,
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: t('absence.title', language),
                    },
                    action_id: 'open_absence_form',
                    style: 'primary',
                  },
                ],
              },
            ],
          },
        });
      } catch (error) {
        console.error('Error publishing home tab:', error);
      }
    });

    // Handle absence type selection via shortcuts
    app.shortcut('request_absence', async ({ shortcut, ack, client }) => {
      await ack();

      // @ts-ignore - Slack type narrowing issue
      if (shortcut.type !== 'message_action' && shortcut.type !== 'global_shortcut') return;

      const userId = shortcut.user.id;
      const userInfo = await client.users.info({ user: userId });
      const language = getUserLanguage(userInfo.user?.locale);

      const state: FlowState = {
        step: 'type',
        data: { userId, userEmail: userInfo.user?.profile?.email || '' },
        language,
      };

      const webappUrl = getWebappUrl(state, language);

      await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: t('absence.title', language),
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${t('absence.title', language)}*\n\n${t('absence.selectType', language)}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: t('common.next', language),
                  },
                  url: webappUrl,
                  style: 'primary',
                },
              ],
            },
          ],
        },
      });
    });

    // Register action handlers
    registerSlackActions(app);

    // Start the app
    (async () => {
      const port = process.env.PORT || 3001;
      await app.start(port);
      console.log(`⚡️ Slack bot is running on port ${port}!`);
    })();
  }
} else {
  console.log('Slack integration disabled (static build or missing configuration)');
}

export default app;

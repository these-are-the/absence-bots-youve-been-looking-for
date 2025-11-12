import { App } from '@slack/bolt';
import { encodeFlowState, FlowState } from '@/lib/statelessFlow';
import { t, Language } from '@/lib/i18n';
import { absenceTypes } from '@/config/absenceTypes';
import { offices } from '@/config/offices';

export function registerSlackActions(app: App) {
  // Handle interactive button clicks for absence type selection
  app.action('select_absence_type', async ({ ack, action, body, client }) => {
    await ack();

    if (!('user' in body) || !('actions' in body) || !action) return;

    const userId = body.user.id;
    const absenceType = (action as any).value;
    const userInfo = await client.users.info({ user: userId });
    const language = (userInfo.user?.locale?.startsWith('sl') ? 'sl' : 
                     userInfo.user?.locale?.startsWith('de') ? 'de' : 'en') as Language;

    const state: FlowState = {
      step: 'office',
      data: { userId, userEmail: userInfo.user?.profile?.email || '', type: absenceType },
      language,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const encoded = encodeFlowState(state);
    const webappUrl = `${baseUrl}/?state=${encoded}&lang=${language}`;

    await client.views.update({
      view_id: (body as any).view?.id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: t('absence.selectOffice', language),
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${t('absence.selectOffice', language)}*\n\n${t('absence.selectType', language)}: ${t(`absence.types.${absenceType}`, language)}`,
            },
          },
          {
            type: 'actions',
            elements: Object.values(offices).map((office, index) => ({
              type: 'button',
              text: {
                type: 'plain_text',
                text: t(`office.${office.id}`, language),
              },
              action_id: 'select_office',
              value: `${absenceType}:${office.id}`,
            })),
          },
        ],
      },
    });
  });

  // Handle office selection
  app.action('select_office', async ({ ack, action, body, client }) => {
    await ack();

    if (!('user' in body) || !('actions' in body) || !action) return;

    const [absenceType, office] = ((action as any).value as string).split(':');
    const userId = body.user.id;
    const userInfo = await client.users.info({ user: userId });
    const language = (userInfo.user?.locale?.startsWith('sl') ? 'sl' : 
                     userInfo.user?.locale?.startsWith('de') ? 'de' : 'en') as Language;

    const typeConfig = absenceTypes[absenceType as keyof typeof absenceTypes];
    const nextStep = typeConfig.durationType === 'both' ? 'duration' : 'dates';

    const state: FlowState = {
      step: nextStep,
      data: { userId, userEmail: userInfo.user?.profile?.email || '', type: absenceType, office },
      language,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const encoded = encodeFlowState(state);
    const webappUrl = `${baseUrl}/?state=${encoded}&lang=${language}`;

    await client.views.update({
      view_id: (body as any).view?.id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: t('absence.selectDate', language),
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${t('absence.selectDate', language)}*\n\nContinue in the web interface to complete your request.`,
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
}

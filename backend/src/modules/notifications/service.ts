import { getQueue, QUEUE_NAMES } from '../../jobs/queues';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('notification-service');

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export interface SendNotificationParams {
  recipient: {
    email?: string;
    phone?: string;
    fullName?: string;
  };
  channels: NotificationChannel[];
  subject?: string;
  text: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  requestId?: string;
  idempotencyKey?: string;
}

export class NotificationService {
  async send(params: SendNotificationParams): Promise<{ jobIds: string[] }> {
    const queue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
    const jobIds: string[] = [];
    const { recipient, channels, subject, text, html, templateId, templateData, requestId, idempotencyKey } = params;

    for (const channel of channels) {
      try {
        const jobId = idempotencyKey ? `${channel}:${idempotencyKey}` : undefined;

        if (channel === 'email' && recipient.email) {
          const job = await queue.add(
            'notification.email',
            {
              to: recipient.email,
              subject: subject || 'Salone Travel Concierge Notification',
              text,
              html,
              templateId,
              dynamicTemplateData: templateData,
              requestId,
            },
            {
              jobId,
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            },
          );
          jobIds.push(job.id || '');
        } else if (channel === 'sms' && recipient.phone) {
          const job = await queue.add(
            'notification.sms',
            {
              to: recipient.phone,
              body: text,
              requestId,
            },
            {
              jobId,
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            },
          );
          jobIds.push(job.id || '');
        } else if (channel === 'whatsapp' && recipient.phone) {
          const job = await queue.add(
            'notification.whatsapp',
            {
              to: recipient.phone,
              body: text,
              templateName: templateId,
              templateParameters: templateData as any,
              requestId,
            },
            {
              jobId,
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            },
          );
          jobIds.push(job.id || '');
        }
      } catch (err: any) {
        log.error({ err: err.message, channel, recipient }, 'Failed to enqueue notification job');
      }
    }

    return { jobIds };
  }
}

export const notificationService = new NotificationService();

import { Job } from 'bullmq';
import { createModuleLogger } from '../../config/logger';
import {
  EmailProvider,
  MockEmailProvider,
  SmsProvider,
  MockSmsProvider,
  WhatsAppProvider,
  MockWhatsAppProvider,
} from '../../integrations';
import { env } from '../../config/env';

const log = createModuleLogger('notification-processor');

export interface EmailJobData {
  type?: 'email';
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  requestId?: string;
}

export interface SmsJobData {
  type?: 'sms';
  to: string;
  body: string;
  requestId?: string;
}

export interface WhatsAppJobData {
  type?: 'whatsapp';
  to: string;
  body: string;
  templateName?: string;
  templateParameters?: Record<string, string>;
  requestId?: string;
}

export interface EmergencyPageJobData {
  conversationId: string;
  notes: string;
  travelerName: string;
  travelerPhone?: string;
  requestId?: string;
}

export type NotificationJobData =
  | EmailJobData
  | SmsJobData
  | WhatsAppJobData
  | EmergencyPageJobData;

export class NotificationProcessor {
  constructor(
    private readonly emailProvider: EmailProvider = new MockEmailProvider(),
    private readonly smsProvider: SmsProvider = new MockSmsProvider(),
    private readonly whatsAppProvider: WhatsAppProvider = new MockWhatsAppProvider(),
  ) {}

  async process(job: Job<NotificationJobData>): Promise<{ success: boolean; messageId: string }> {
    const data = job.data;
    const jobName = job.name;
    const startTime = Date.now();

    log.info(
      {
        jobId: job.id,
        jobName,
        attempt: job.attemptsMade + 1,
      },
      'Processing notification job',
    );

    try {
      let result: { messageId: string };

      if (jobName === 'emergency.page_oncall') {
        const emergencyData = data as EmergencyPageJobData;
        const phone = env.EMERGENCY_ON_CALL_PHONE || '+23276000999';
        const text = `🚨 URGENT: Traveler ${emergencyData.travelerName} escalated emergency in conversation #${emergencyData.conversationId.slice(0, 8)}. Notes: ${emergencyData.notes}`;

        const smsRes = await this.smsProvider.send({ to: phone, body: text });
        const waPhone = env.EMERGENCY_ON_CALL_WHATSAPP || phone;
        await this.whatsAppProvider.send({ to: waPhone, body: text });

        result = { messageId: smsRes.messageId };
      } else if (
        jobName?.startsWith('notification.whatsapp') ||
        (data as any).type === 'whatsapp'
      ) {
        const waData = data as WhatsAppJobData;
        result = await this.whatsAppProvider.send({
          to: waData.to,
          body: waData.body,
          templateName: waData.templateName,
          templateParameters: waData.templateParameters,
        });
      } else if (
        jobName?.startsWith('notification.sms') ||
        (data as any).type === 'sms'
      ) {
        const smsData = data as SmsJobData;
        result = await this.smsProvider.send({
          to: smsData.to,
          body: smsData.body,
        });
      } else {
        // Default to email
        const emailData = data as EmailJobData;
        result = await this.emailProvider.send({
          to: emailData.to,
          subject: emailData.subject || 'Salone Travel Concierge Notification',
          text: emailData.text,
          html: emailData.html,
          templateId: emailData.templateId,
          dynamicTemplateData: emailData.dynamicTemplateData,
        });
      }

      const duration = Date.now() - startTime;
      log.info(
        {
          jobId: job.id,
          jobName,
          messageId: result.messageId,
          durationMs: duration,
        },
        'Notification job completed successfully',
      );

      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      log.error(
        {
          err: err.message,
          jobId: job.id,
          jobName,
          attempt: job.attemptsMade + 1,
        },
        'Notification job processing failed',
      );
      throw err;
    }
  }
}

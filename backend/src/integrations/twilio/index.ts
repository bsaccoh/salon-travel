export interface SmsMessage {
  to: string; // E.164
  body: string;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<{ messageId: string }>;
}

export class MockSmsProvider implements SmsProvider {
  async send(_message: SmsMessage): Promise<{ messageId: string }> {
    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { messageId };
  }
}

export * from './twilio-whatsapp.provider';

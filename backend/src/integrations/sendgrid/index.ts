export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}

export class MockEmailProvider implements EmailProvider {
  async send(_message: EmailMessage): Promise<{ messageId: string }> {
    const messageId = `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { messageId };
  }
}

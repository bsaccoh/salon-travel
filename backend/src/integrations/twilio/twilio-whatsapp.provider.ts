export interface WhatsAppMessage {
  to: string; // E.164 (e.g. +23276000001)
  body: string;
  templateName?: string;
  templateParameters?: Record<string, string>;
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<{ messageId: string }>;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  async send(_message: WhatsAppMessage): Promise<{ messageId: string }> {
    const messageId = `mock_wa_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { messageId };
  }
}

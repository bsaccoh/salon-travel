export interface CreatePaymentIntentParams {
  amountCents: number;
  currency: string;
  bookingId: string;
  travelerId: string;
  providerId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  status: string;
}

export interface CreateRefundParams {
  paymentIntentId: string;
  amountCents?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  paymentIntentId: string;
  amountCents: number;
  status: string;
}

export interface PaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams, idempotencyKey?: string): Promise<PaymentIntentResult>;
  createRefund(params: CreateRefundParams, idempotencyKey?: string): Promise<RefundResult>;
  retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult>;
}

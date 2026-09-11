import { PaymentProvider, CreatePaymentIntentParams, PaymentIntentResult, CreateRefundParams, RefundResult } from './stripe.types';
import { getStripeClient } from './stripe.client';
import { AppError } from '../../common/errors';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('stripe-provider');

export class StripePaymentProvider implements PaymentProvider {
  async createPaymentIntent(
    params: CreatePaymentIntentParams,
    idempotencyKey?: string,
  ): Promise<PaymentIntentResult> {
    const stripe = getStripeClient();

    if (!stripe) {
      log.warn('Stripe secret key not configured — generating mock PaymentIntent');
      const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      return {
        clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).slice(2, 9)}`,
        paymentIntentId,
        amountCents: params.amountCents,
        currency: params.currency.toLowerCase(),
        status: 'requires_payment_method',
      };
    }

    try {
      const intent = await stripe.paymentIntents.create(
        {
          amount: params.amountCents,
          currency: params.currency.toLowerCase(),
          automatic_payment_methods: { enabled: true },
          metadata: {
            bookingId: params.bookingId,
            travelerId: params.travelerId,
            providerId: params.providerId,
            ...params.metadata,
          },
        },
        idempotencyKey ? { idempotencyKey } : undefined,
      );

      return {
        clientSecret: intent.client_secret || '',
        paymentIntentId: intent.id,
        amountCents: intent.amount,
        currency: intent.currency,
        status: intent.status,
      };
    } catch (err: any) {
      log.error({ err: err.message, bookingId: params.bookingId }, 'Stripe PaymentIntent creation failed');
      throw new AppError({
        statusCode: 502,
        code: 'UPSTREAM_PAYMENT_ERROR',
        message: err.message || 'Upstream payment processor failure',
      });
    }
  }

  async createRefund(
    params: CreateRefundParams,
    idempotencyKey?: string,
  ): Promise<RefundResult> {
    const stripe = getStripeClient();

    if (!stripe) {
      log.warn('Stripe secret key not configured — generating mock Refund');
      const refundId = `re_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      return {
        refundId,
        paymentIntentId: params.paymentIntentId,
        amountCents: params.amountCents ?? 0,
        status: 'succeeded',
      };
    }

    try {
      const refund = await stripe.refunds.create(
        {
          payment_intent: params.paymentIntentId,
          amount: params.amountCents,
          reason: params.reason,
          metadata: params.metadata,
        },
        idempotencyKey ? { idempotencyKey } : undefined,
      );

      return {
        refundId: refund.id,
        paymentIntentId: params.paymentIntentId,
        amountCents: refund.amount,
        status: refund.status || 'succeeded',
      };
    } catch (err: any) {
      log.error({ err: err.message, paymentIntentId: params.paymentIntentId }, 'Stripe Refund creation failed');
      throw new AppError({
        statusCode: 502,
        code: 'UPSTREAM_REFUND_ERROR',
        message: err.message || 'Upstream refund processor failure',
      });
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    const stripe = getStripeClient();

    if (!stripe) {
      return {
        clientSecret: `${paymentIntentId}_secret_mock`,
        paymentIntentId,
        amountCents: 10000,
        // WARNING: Stripe does not natively support the SLE (New Leone) currency code.
        // For production, we must implement a currency exchange layer to charge in USD or supported equivalents,
        // while the Salone Travel database exclusively records SLE.
        // For MVP development, we simulate the charge using 'SLE'.
        currency: 'SLE',
        status: 'succeeded',
      };
    }

    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        clientSecret: intent.client_secret || '',
        paymentIntentId: intent.id,
        amountCents: intent.amount,
        currency: intent.currency,
        status: intent.status,
      };
    } catch (err: any) {
      log.error({ err: err.message, paymentIntentId }, 'Stripe retrieve PaymentIntent failed');
      throw new AppError({
        statusCode: 502,
        code: 'UPSTREAM_PAYMENT_ERROR',
        message: err.message || 'Upstream payment processor lookup failure',
      });
    }
  }
}

export const stripePaymentProvider = new StripePaymentProvider();

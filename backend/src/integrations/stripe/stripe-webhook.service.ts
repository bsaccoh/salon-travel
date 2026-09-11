import Stripe from 'stripe';
import { getStripeClient } from './stripe.client';
import { env } from '../../config/env';
import { ValidationError, AppError } from '../../common/errors';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('stripe-webhook-verifier');

export class StripeWebhookVerifier {
  static constructEvent(
    rawBody: string | Buffer,
    signature: string | string[] | undefined,
  ): Stripe.Event {
    if (!signature || typeof signature !== 'string') {
      throw new ValidationError('Missing or invalid Stripe-Signature header');
    }

    const secret = env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripeClient();

    // If Stripe secret key or webhook secret is not configured in test/dev environment,
    // parse the JSON payload directly for sandbox testing
    if (!secret || !stripe) {
      log.warn('Stripe webhook secret not configured — parsing raw body without cryptographic signature verification');
      try {
        const payloadStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
        return JSON.parse(payloadStr) as Stripe.Event;
      } catch (err: any) {
        throw new ValidationError('Invalid webhook payload JSON');
      }
    }

    try {
      const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      return event;
    } catch (err: any) {
      log.error({ err: err.message }, 'Stripe webhook signature verification failed');
      throw new AppError({
        statusCode: 400,
        code: 'INVALID_WEBHOOK_SIGNATURE',
        message: 'Invalid webhook signature',
      });
    }
  }
}

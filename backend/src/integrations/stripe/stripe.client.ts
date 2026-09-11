import Stripe from 'stripe';
import { env } from '../../config/env';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('stripe-client');

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      telemetry: false,
    });
    log.info('Stripe SDK client initialized');
  }

  return stripeInstance;
}

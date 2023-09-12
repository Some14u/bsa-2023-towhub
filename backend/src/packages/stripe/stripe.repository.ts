import Stripe from 'stripe';

import { type config as baseConfig } from '~/libs/packages/config/config.js';
import { type UserEntityObjectWithGroupAndBusinessT } from '~/packages/users/users.js';

import { FrontendPath } from './libs/enums/enums.js';
import { type CheckoutProperties } from './libs/types/types.js';

class StripeRepository {
  private stripe: Stripe;

  private config: typeof baseConfig.ENV;

  public constructor(config: typeof baseConfig.ENV) {
    this.config = config;
    this.stripe = new Stripe(this.config.STRIPE.API_KEY, {
      apiVersion: this.config.STRIPE.API_VERSION,
    });
  }

  public constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.STRIPE.WEBHOOK_SECRET,
    );
  }

  public async createCheckoutSession({
    business,
    distance,
    pricePerUnit,
  }: CheckoutProperties): Promise<string | null> {
    if (!business.stripeActivated || !business.stripeId) {
      throw new Error(
        'Business without activated stripe account is not supported',
      );
    }

    const { default_currency } = await this.retrieveExpressAccount(
      business.stripeId,
    );

    const total = this.calculateTotal({
      price: pricePerUnit,
      quantity: distance,
    });

    const totalToBusiness = total - this.calculateApplicationFee(total);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: default_currency ?? 'usd',
            unit_amount: this.inCents(pricePerUnit),
            product_data: {
              name: 'Towing services',
            },
          },
          quantity: distance,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: business.stripeId,
          amount: this.inCents(totalToBusiness),
        },
      },
      mode: 'payment',
      success_url: `${this.config.APP.FRONTEND_BASE_URL}${FrontendPath.CHECKOUT}?success=true`,
      cancel_url: `${this.config.APP.FRONTEND_BASE_URL}${FrontendPath.CHECKOUT}?cancel=true`,
    });

    return session.url;
  }

  public createExpressAccount(
    user: UserEntityObjectWithGroupAndBusinessT,
  ): Promise<Stripe.Account> {
    const accountParameters: Stripe.AccountCreateParams = {
      type: 'express',

      email: user.email,
      business_type: 'company',
      company: {
        name: user.business.companyName,
        tax_id: user.business.taxNumber,
      },
      metadata: {
        userId: user.id,
        businessId: user.business.id,
      },
    };

    return this.stripe.accounts.create(accountParameters);
  }

  public retrieveExpressAccount(id: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(id);
  }

  public generateExpressAccountOnboardingLink(
    account: Stripe.Account,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.config.APP.FRONTEND_BASE_URL}${FrontendPath.SETUP_PAYMENT}?refresh=true`,
      return_url: `${this.config.APP.FRONTEND_BASE_URL}${FrontendPath.SETUP_PAYMENT}?success=true`,
      type: 'account_onboarding',
    });
  }

  private calculateTotal({
    price, // Made it like this as a sanity check
    quantity,
  }: {
    price: number;
    quantity: number;
  }): number {
    return price * quantity;
  }

  private calculateApplicationFee(amount: number): number {
    return amount * this.config.BUSINESS.APPLICATION_FEE_AMOUNT;
  }

  private inCents(amount: number): number {
    return Math.round(amount * 100);
  }
}

export { StripeRepository };

import { type GetPaymentsResponse } from 'shared/build/index.js';
import { type Stripe } from 'stripe';

import { HttpCode, HttpError, HttpMessage } from '~/libs/packages/http/http.js';

import { type BusinessService } from '../business/business.service.js';
import { type OrderEntity } from '../orders/libs/types/types.js';
import { type ShiftEntity } from '../shifts/libs/types/types.js';
import { type TruckService } from '../trucks/truck.service.js';
import { type UserEntityObjectWithGroupT } from '../users/users.js';
import { DEFAULT_PAGE_SIZE } from './libs/consts/const.js';
import { StripeEvent } from './libs/enums/stripe-event.enum.js';
import { paginateArray } from './libs/helpers/paginate-array.helper.js';
import {
  type CheckoutMetadata,
  type GetPaymentsRequest,
} from './libs/types/types.js';
import { PaymentEntity } from './payment.entity.js';
import { type StripeRepository } from './stripe.repository.js';

class StripeService {
  private stripeRepository: StripeRepository;

  private businessService: BusinessService;

  private truckService: TruckService;

  public constructor(
    stripeRepository: StripeRepository,
    businessService: BusinessService,
    truckService: TruckService,
  ) {
    this.stripeRepository = stripeRepository;
    this.businessService = businessService;
    this.truckService = truckService;
  }

  public async generateExpressAccountLink(
    user: UserEntityObjectWithGroupT,
  ): Promise<string> {
    const business = await this.businessService.findByOwnerId(user.id);

    if (!business) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpMessage.BUSINESS_DOES_NOT_EXIST,
      });
    }

    const userWithBusiness = {
      ...user,
      business,
    };

    // If there is no account yet, creating new, othewise retrieving from stripe
    const account = business.stripeId
      ? await this.stripeRepository.retrieveExpressAccount(business.stripeId)
      : await this.stripeRepository.createExpressAccount(userWithBusiness);

    // If business has no account attached, attach it
    if (!business.stripeId) {
      await this.businessService.update({
        id: business.id,
        payload: { stripeId: account.id },
      });
    }

    const link =
      await this.stripeRepository.generateExpressAccountOnboardingLink(account);

    return link.url;
  }

  public async processWebhook(event: Stripe.DiscriminatedEvent): Promise<void> {
    // console.log('-----Webhooks');
    // console.log(event);

    switch (event.type) {
      case StripeEvent.CAPABILITY_UPDATED: {
        {
          if (event.account && event.data.object.status === 'active') {
            // Linked account has been activated
            const business = await this.businessService.findByStripeId(
              event.account,
            );

            if (business && !business.stripeActivated) {
              await this.businessService.update({
                id: business.id,
                payload: { stripeActivated: true },
              });
            }
          }
        }
        break;
      }
      case StripeEvent.PAYMENT_INTENT_SUCCEEDED: {
        // Handle successfull payment
        event.data.object.status;

        return;
      }
      default:
    }
  }

  public async generateCheckoutLink(
    order: OrderEntity,
    shift: ShiftEntity,
    distance: number,
  ): Promise<string | null> {
    const business = await this.businessService.findById(order.businessId);

    if (!business) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpMessage.BUSINESS_DOES_NOT_EXIST,
      });
    }

    const truck = await this.truckService.findById(shift.truckId);

    if (!truck) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpMessage.TRUCK_DOES_NOT_EXIST,
      });
    }

    if (!business.stripeActivated || !business.stripeId) {
      throw new Error(
        'Business without activated stripe account is not supported',
      );
    }

    const metadata: CheckoutMetadata = {
      businessId: business.id,
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      userId: order.userId,
    };

    return await this.stripeRepository.createCheckoutSession({
      businessStripeId: business.stripeId,
      distance,
      pricePerUnit: truck.pricePerKm,
      metadata,
    });
  }

  public async getPayments(
    user: UserEntityObjectWithGroupT,
    options: GetPaymentsRequest,
  ): Promise<GetPaymentsResponse> {
    const business = await this.businessService.findByOwnerId(user.id);

    if (!business) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpMessage.BUSINESS_DOES_NOT_EXIST,
      });
    }

    const items = await this.stripeRepository.collectPaymentIntents(
      business.id,
      options,
    );

    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;

    const itemsAsDto = paginateArray(items, page, limit).map((item) =>
      PaymentEntity.initialize(item, item.metadata).toObject(),
    );

    return {
      items: itemsAsDto,
      totalCount: items.length,
    };
  }
}

export { StripeService };

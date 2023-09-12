import { ApiPath, ContentType } from '~/libs/enums/enums.js';
import { HttpApi } from '~/libs/packages/api/api.js';
import { type IHttp } from '~/libs/packages/http/http.js';
import { type IStorage } from '~/libs/packages/storage/storage.js';

import { StripeApiPath } from './libs/enums/enums.js';
import { type GenerateCheckoutLinkRequest } from './types/types.js';

type Constructor = {
  baseUrl: string;
  http: IHttp;
  storage: IStorage;
};

class StripeApi extends HttpApi {
  public constructor({ baseUrl, http, storage }: Constructor) {
    super({ path: ApiPath.STRIPE, baseUrl, http, storage });
  }

  public async generateExpressAccountLink(): Promise<string> {
    const response = await this.load(
      this.getFullEndpoint(StripeApiPath.GENERATE_EXPRESS_ACCOUNT_LINK, {}),
      {
        method: 'GET',
        contentType: ContentType.JSON,
        hasAuth: true,
      },
    );
    const decoded = await response.json<{ result: string }>();

    return decoded.result;
  }

  public async generateCheckoutLink(
    payload: GenerateCheckoutLinkRequest,
  ): Promise<string> {
    const response = await this.load(
      this.getFullEndpoint(StripeApiPath.GENERATE_CHECKOUT_LINK, {}),
      {
        method: 'POST',
        contentType: ContentType.JSON,
        hasAuth: true,
        payload: JSON.stringify(payload),
      },
    );
    const decoded = await response.json<{ result: string }>();

    return decoded.result;
  }
}

export { StripeApi as StripeApi };

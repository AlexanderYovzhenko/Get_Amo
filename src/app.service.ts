import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { QueryParams, Tokens } from './types/interfaces';
import {
  DEAL_STATUS_ONE_ID,
  FIELD_ID_EMAIL,
  FIELD_ID_PHONE,
} from './common/constants/constants';

@Injectable()
export class AppService {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async makeDeal(queryParams: QueryParams) {
    const { email, phone } = queryParams;

    // Проверяем, получаем или обновляем токены
    if (!this.access_token) {
      await this.getTokens();
    }

    if (Date.now() > this.expires_in) {
      await this.updateTokens();
    }

    // Получаем, создаём или обновляем контакт
    let contacts = await this.getContact(email, phone);

    if (contacts) {
      const id = contacts?._embedded?.contacts[0]?.id;
      await this.updateContact(queryParams, id);
    } else {
      contacts = await this.createContact(queryParams);
    }

    const contact = contacts?._embedded?.contacts[0];

    // Создаём сделку
    const deal = await this.createDeal(contact?.id);

    return deal;
  }

  // Methods for deals
  private async createDeal(id: number) {
    const response = await firstValueFrom(
      this.httpService
        .post(
          (await this.configService.get('AMO_URL')) + '/api/v4/leads',
          [
            {
              name: 'deal',
              status_id: DEAL_STATUS_ONE_ID,
              _embedded: {
                contacts: [
                  {
                    id,
                  },
                ],
              },
            },
          ],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${this.token_type} ${this.access_token}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    return response.data;
  }

  // Methods for contacts
  private async getContact(email: string, phone: string) {
    let contact = null;
    contact = await this.getContactByEmailOrPhone(email, 'email');

    if (!contact) {
      contact = await this.getContactByEmailOrPhone(phone, 'phone');
    }

    return contact;
  }

  private async getContactByEmailOrPhone(
    searchValue: string,
    searchField: string,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .get((await this.configService.get('AMO_URL')) + '/api/v4/contacts', {
          params: {
            query: searchValue,
            search: searchField,
          },
          headers: {
            Authorization: `${this.token_type} ${this.access_token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    return response.data;
  }

  private async createContact(queryParams: QueryParams) {
    const response = await firstValueFrom(
      this.httpService
        .post(
          (await this.configService.get('AMO_URL')) + '/api/v4/contacts',
          [
            {
              name: queryParams.name,
              custom_fields_values: [
                {
                  field_id: FIELD_ID_EMAIL,
                  values: [
                    {
                      value: queryParams.email,
                    },
                  ],
                },
                {
                  field_id: FIELD_ID_PHONE,
                  values: [
                    {
                      value: queryParams.phone,
                    },
                  ],
                },
              ],
            },
          ],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${this.token_type} ${this.access_token}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    console.info('Create contact');

    return response.data;
  }

  private async updateContact(queryParams: QueryParams, id: number) {
    const response = await firstValueFrom(
      this.httpService
        .patch(
          (await this.configService.get('AMO_URL')) + '/api/v4/contacts',
          [
            {
              id,
              name: queryParams.name,
              custom_fields_values: [
                {
                  field_id: FIELD_ID_EMAIL,
                  values: [
                    {
                      value: queryParams.email,
                    },
                  ],
                },
                {
                  field_id: FIELD_ID_PHONE,
                  values: [
                    {
                      value: queryParams.phone,
                    },
                  ],
                },
              ],
            },
          ],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${this.token_type} ${this.access_token}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    console.info('Update contact');

    return response.data;
  }

  // Methods for tokens
  private async getTokens() {
    const response = await firstValueFrom(
      this.httpService
        .post(
          (await this.configService.get('AMO_URL')) + '/oauth2/access_token',
          {
            client_id: await this.configService.get('AMO_ID_INTEGRATION'),
            client_secret: await this.configService.get('AMO_SECRET_KEY'),
            grant_type: 'authorization_code',
            code: await this.configService.get('AMO_CODE'),
            redirect_uri: await this.configService.get('APP_URL'),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    await this.saveTokens(response.data);

    return response;
  }

  private async updateTokens() {
    const response = await firstValueFrom(
      this.httpService
        .post(
          (await this.configService.get('AMO_URL')) + '/oauth2/access_token',
          {
            client_id: await this.configService.get('AMO_ID_INTEGRATION'),
            client_secret: await this.configService.get('AMO_SECRET_KEY'),
            grant_type: 'refresh_token',
            refresh_token: this.refresh_token,
            redirect_uri: await this.configService.get('APP_URL'),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(JSON.stringify(error.response.data));
          }),
        ),
    );

    await this.saveTokens(response.data);

    return response;
  }

  private async saveTokens(tokens: Tokens) {
    this.access_token = tokens.access_token;
    this.refresh_token = tokens.refresh_token;
    this.expires_in = Date.now() + tokens.expires_in;
    this.token_type = tokens.token_type;

    return;
  }
}

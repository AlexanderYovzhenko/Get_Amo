import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Tokens } from './types/interfaces';

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

  async makeDeal() {
    if (!this.access_token) {
      await this.getTokens();
    } else {
      await this.updateTokens();
    }

    return {
      access_token: this.access_token,
      refresh_token: this.refresh_token,
    };
  }

  private async getTokens() {
    const response = await firstValueFrom(
      this.httpService
        .post(await this.configService.get('AMO_URL_GET_TOKENS'), {
          client_id: await this.configService.get('AMO_ID_INTEGRATION'),
          client_secret: await this.configService.get('AMO_SECRET_KEY'),
          grant_type: 'authorization_code',
          code: await this.configService.get('AMO_CODE'),
          redirect_uri: await this.configService.get('NGROK_URL_APP'),
        })
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
    console.log(this.refresh_token);

    const response = await firstValueFrom(
      this.httpService
        .post(await this.configService.get('AMO_URL_GET_TOKENS'), {
          client_id: await this.configService.get('AMO_ID_INTEGRATION'),
          client_secret: await this.configService.get('AMO_SECRET_KEY'),
          grant_type: 'refresh_token',
          refresh_token: this.refresh_token,
          redirect_uri: await this.configService.get('NGROK_URL_APP'),
        })
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
    this.expires_in = tokens.expires_in;
    this.token_type = tokens.token_type;

    return;
  }
}

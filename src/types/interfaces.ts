interface QueryParams {
  name: string;
  email: string;
  phone: string;
}
interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export { QueryParams, Tokens };

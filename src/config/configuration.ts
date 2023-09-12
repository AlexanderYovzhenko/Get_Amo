export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 80,
  NGROK_URL_APP: process.env.NGROK_URL_APP,
  AMO: {
    AMO_ID_INTEGRATION: process.env.AMO_ID_INTEGRATION,
    AMO_SECRET_KEY: process.env.AMO_SECRET_KEY,
    AMO_CODE: process.env.AMO_CODE,
    AMO_URL_TOKENS: process.env.AMO_URL_TOKENS,
  },
});

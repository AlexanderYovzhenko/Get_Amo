export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 80,
  APP_URL: process.env.APP_URL,
  AMO: {
    AMO_ID_INTEGRATION: process.env.AMO_ID_INTEGRATION,
    AMO_SECRET_KEY: process.env.AMO_SECRET_KEY,
    AMO_CODE: process.env.AMO_CODE,
    AMO_URL: process.env.AMO_URL,
  },
});

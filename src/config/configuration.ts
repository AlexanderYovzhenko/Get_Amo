export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 80,
  AMO: {
    AMO_URL_GET_TOKENS: process.env.AMO_URL_GET_TOKENS,
  },
});

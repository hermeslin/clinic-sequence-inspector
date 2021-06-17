const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  app: {
    cronTime: process.env.APP_CRON_TIME,
  },
  clinic: {
    endpoint: process.env.CLINIC_ENDPOINT,
    seq_befroe: process.env.CLINIC_SEQ_BEFORE,
  },
  slack: {
    botId: process.env.SLACK_BOT_ID,
    verifycationToken: process.env.SLACK_VERIFYCATION_TOKEN,
    accessToken: process.env.SLACK_BOT_ACCESS_TOKEN,
  },
};

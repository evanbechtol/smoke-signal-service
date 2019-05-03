const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DBURL || `mongodb://${process.env.DBUSER}:${process.env.DBPASS}@ds343895.mlab.com:43895/smoke-signal`,
  eAuthUrl: process.env.EAUTHURL || "http://129.192.179.179",
  env: process.env.NODE_ENV || "development",
  logDir: process.env.LOGDIR || "logs",
  viewEngine: process.env.VIEW_ENGINE || "html",
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  slackChannel: process.env.SLACK_CHANNEL || "#test_smoke_signal_e",
  iconEmoji: process.env.ICON_URL || ":econ:",
  slackUsername: process.env.SLACK_USERNAME || "Hero",
  release: process.env.RELEASE || "1.0.0",
  sentryDsn: process.env.SENTRYDSN,
  key: process.env.KEY,
  cert: process.env.CERT
};

module.exports = config;

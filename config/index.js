const config = {
  port       : process.env.PORT || 3000,
  dbUrl      : process.env.DBURL || `mongodb://${process.env.DBUSER}:${process.env.DBPASS}@ds343895.mlab.com:43895/smoke-signal`,
  eAuthUrl   : process.env.EAUTHURL || 'http://129.192.179.179',
  env        : process.env.NODE_ENV || 'development',
  logDir     : process.env.LOGDIR || 'logs',
  viewEngine : process.env.VIEW_ENGINE || 'html'
};

module.exports = config;

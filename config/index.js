const config = {
  port       : process.env.PORT || 3000,
  dbUrl      : process.env.DBURL || 'mongodb://localhost:27017/smoke-signal',//`mongodb://${process.env.DBUSER}:${process.env.DBPASS}@ds343895.mlab.com:43895/smoke-signal`,
  eAuthUrl   : process.env.EAUTHURL || 'http://localhost:3500',
  env        : process.env.NODE_ENV || 'development',
  logDir     : process.env.LOGDIR || 'logs',
  viewEngine : process.env.VIEW_ENGINE || 'html'
};

module.exports = config;

const config = require( "./config" );
const mongoose = require( "mongoose" );
const logger = require( "./services/Logger" );
const Sentry = require( "@sentry/node" );

// Initialize Sentry
const SentryLoader = require( "./loaders/Sentry" );
const SentryInstance = new SentryLoader( config.sentryDsn, config.env, config.release );
SentryInstance.init();

const mongooseOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  autoReconnect: true
};

mongoose.Promise = global.Promise;

// Connect to the DB an initialize the app if successful
mongoose.connect( config.dbUrl, mongooseOptions )
  .then( () => {
    logger.info( "Database connection successful" );

    // Create express instance to setup API
    const ExpressLoader = require( "./loaders/Express" );
    const ExpressInstance = new ExpressLoader();

    // Create socket instance to handle connections
    const SocketIoLoader = require( "./loaders/SocketIO" );
    const socketPath = "/smoke-signal-socket/socket.io";
    new SocketIoLoader( ExpressInstance.getServer(), socketPath );
  } )
  .catch( err => {
    //eslint-disable-next-line
    console.error( err );
    logger.error( err );

    Sentry.captureException( err );
  } );

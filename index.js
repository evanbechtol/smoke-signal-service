const config = require( "./config" );
const mongoose = require( "mongoose" );
const logger = require( "./services/Logger" );
const Sentry = require( "@sentry/node" );

// Todo: remove this when you can setup https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

Sentry.init( {
  dsn: config.sentryDsn,
  environment: process.env.NODE_ENV || "development",
  release: config.release
} );

Sentry.configureScope( scope => {
  //eslint-disable-next-line
  scope.addEventProcessor( ( event, hint ) => {
    // Add anything to the event here
    // returning null will drop the event
    logger.info( `Sentry event logged: ${JSON.stringify( event )}` );
    return event;
  } );
} );


const mongooseOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  autoReconnect: true
};

mongoose.Promise = global.Promise;
mongoose.connect( config.dbUrl, mongooseOptions )
  .then( () => {
    logger.info( "Database connection successful" );

    // Create express instance to setup API
    const ExpressLoader = require( "./loaders/Express" );
    const ExpressInstance = new ExpressLoader();

    // Create socket instance to handle connections
    const SocketIoLoader = require( "./loaders/SocketIO" );
    const socketPath = "/smoke-signal-service/socket.io";
    new SocketIoLoader( ExpressInstance.getServer(), socketPath );
  } )
  .catch( err => {
    //eslint-disable-next-line
    console.error( err );
    logger.error( err );

    Sentry.captureException( err );
  } );

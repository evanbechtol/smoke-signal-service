const bodyParser = require( "body-parser" );
const config = require( "./config" );
const express = require( "express" );
const morgan = require( "morgan" );
const path = require( "path" );
const routes = require( "./routes" );
const compression = require( "compression" );
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
  scope.addEventProcessor( ( event, hint ) => {
    // Add anything to the event here
    // returning null will drop the event
    logger.info( `Sentry event logged: ${event}` );
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

    let app = express();

    // Setup error handling, this must be after all other middleware
    app.use( errorHandler );

    // Serve static content
    app.use( express.static( path.join( __dirname, "uploads" ) ) );

    // Set up middleware
    app.use( morgan( "dev" ) );
    app.use( compression() );
    app.use( bodyParser.urlencoded( {
      extended: false,
      limit: "20mb"
    } ) );
    app.use( bodyParser.json( { limit: "20mb" } ) );

    // Pass app to routes
    routes( app );


    // Start application
    const server = app.listen( config.port, () => {
      logger.info( `Express running, now listening on port ${config.port}` );
      Sentry.withScope( ( scope ) => {
        scope.setLevel( "info" );
        Sentry.captureMessage( `Service running on port ${config.port}` );
      } );
    } );

    const io = require( "socket.io" )( server, { path: "/smoke-signal-service/socket.io" } );
    io.origins( "*:*" );
    io.on( "connection", function ( socket ) {
      logger.info( connMsg( socket.id, "connected", "/" ) );
      require( "./controllers/Socket" )( io, socket );
      socket.on( "disconnect", function () {
        logger.info( connMsg( socket.id, "disconnected", "/" ) );
      } );
    } );

    io.of( "/smoke-signal-service" ).on( "connection", function ( socket ) {
      logger.info( connMsg( socket.id, "connected", "/smoke-signal/" ) );
      require( "./controllers/Socket" )( io, socket );
      socket.on( "disconnect", function () {
        logger.info( connMsg( socket.id, "disconnected", "/smoke-signal/" ) );
      } );
    } );
  } )
  .catch( err => {
    console.error( err );
    logger.error( err );
  } );

function connMsg ( action, id, nsp ) {
  return `User ID '${id}' ${action} from namespace ${nsp}`;
}

/**
 * @description Default error handler to be used with express
 * @param error Error object
 * @param req {object} Express req object
 * @param res {object} Express res object
 * @param next {function} Express next object
 * @returns {*}
 */
function errorHandler ( error, req, res, next ) {
  let parsedError;

  Sentry.configureScope( ( scope ) => {
    scope.setLevel( "error" );
    Sentry.captureException( error );
  } );
  // Attempt to gracefully parse error object
  try {
    if ( error && typeof error === "object" ) {
      parsedError = JSON.stringify( error );
    } else {
      parsedError = error;
    }
  } catch ( e ) {
    logger.error( e );
  }

  // Log the original error
  logger.error( parsedError );

  // If response is already sent, don't attempt to respond to client
  if ( res.headersSent ) {
    return next( error );
  }

  res.status( 400 ).json( {
    success: false,
    error
  } );
}

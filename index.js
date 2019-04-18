const bodyParser  = require( "body-parser" ),
      config      = require( "./config" ),
      express     = require( "express" ),
      morgan      = require( "morgan" ),
      path        = require( "path" ),
      routes      = require( "./routes" ),
      compression = require( "compression" ),
      mongoose    = require( "mongoose" ),
      logger      = require( "./config/logger" );

const mongooseOptions = {
  useCreateIndex  : true,
  useNewUrlParser : true,
  autoReconnect   : true
};

mongoose.Promise = global.Promise;
mongoose.connect( config.dbUrl, mongooseOptions )
    .then( () => {
      logger.info( "Database connection successful" );

      let app = express();

      // Serve static content
      app.use( express.static( path.join( __dirname, "uploads" ) ) );

      // Set up middleware
      app.use( morgan( "dev" ) );
      app.use( compression() );
      app.use( bodyParser.urlencoded( {
        extended : false,
        limit    : "20mb"
      } ) );
      app.use( bodyParser.json( { limit : "20mb" } ) );

      // Pass app to routes
      routes( app );

      // Setup error handling, this must be after all other middleware
      app.use( errorHandler );

      // Start application
      const server = app.listen( config.port, () => {
        logger.info( `Express running, now listening on port ${config.port}` );
      } );

      const io = require( "socket.io" )( server, { path : "/smoke-signal-service/socket.io" } );
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
    success : false,
    error
  } );
}

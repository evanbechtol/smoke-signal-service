const bodyParser  = require( "body-parser" ),
      config      = require( "./config" ),
      express     = require( "express" ),
      morgan      = require( "morgan" ),
      path        = require( "path" ),
      routes      = require( "./routes" ),
      compression = require( "compression" ),
      mongoose    = require( "mongoose" ),
      logger      = require( "./config/logger" );

// This is dangerous a.f., but has to be done for prod
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//require('ssl-root-cas/latest').inject();

mongoose.Promise = global.Promise;
mongoose.connect( config.dbUrl, {
  useCreateIndex  : true,
  useNewUrlParser : true,
  autoReconnect   : true
}, ( err ) => {
  if ( err ) {
    throw err;
  }
  console.log( "Database connection successful" );
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

  // Start application
  const server = app.listen( config.port, () => {
    console.log( `Express running, now listening on port ${config.port}` );
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
} );

function connMsg ( action, id, nsp ) {
  return `User ID '${id}' ${action} from namespace ${nsp}`;
}

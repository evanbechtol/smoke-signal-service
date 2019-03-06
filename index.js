const bodyParser  = require( "body-parser" ),
      config      = require( "./config" ),
      express     = require( "express" ),
      morgan      = require( "morgan" ),
      path        = require( "path" ),
      routes      = require( "./routes" ),
      compression = require( "compression" ),
      mongoose    = require( "mongoose" ),
      logger      = require( "./config/logger" );

mongoose.Promise = global.Promise;
mongoose.connect( config.dbUrl, {
  useCreateIndex  : true,
  useNewUrlParser : true,
  autoReconnect   : true
}, ( err ) => {
  if ( err ) {
    throw err;
  }
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
    logger.info( `Express running, now listening on port ${config.port}` );
  } );

  const io = require( "socket.io" ).listen( server );
  io.origins( "*:*" );
  io.on( "connection", function ( socket ) {
    logger.info( `User with ID '${socket.id}' connected to namespace '${socket.nsp.name}'` );

    require( "./controllers/Socket" )( io, socket );

    socket.on( "disconnect", function () {
      logger.info( `User with ID '${socket.id}' disconnected from namespace '${socket.nsp.name}'` );
    } );
  } );
} );

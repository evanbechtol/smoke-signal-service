const bodyParser  = require( 'body-parser' ),
      config      = require( './config' ),
      express     = require( 'express' ),
      morgan      = require( 'morgan' ),
      path        = require( 'path' ),
      routes      = require( './routes' ),
      compression = require( 'compression' ),
      mongoose    = require( 'mongoose' ),
      logger      = require( './config/logger');

mongoose.Promise = global.Promise;
mongoose.connect( config.dbUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  autoReconnect  : true
}, ( err ) => {
  if ( err ) {
    throw err;
  }
  logger.info( 'Database connection successful' );


  let app = express();

// Setup views and pathing
  app.set( 'view engine', config.viewEngine );
  app.set( 'views', path.join( __dirname, 'public' ) );

// Serve static content
  app.use( express.static( path.join( __dirname, 'public' ) ) );

// Set up middleware
  app.use( morgan( 'dev' ) );
  app.use( compression() );
  app.use( bodyParser.urlencoded( {
    extended : false,
    limit    : '20mb'
  } ) );
  app.use( bodyParser.json( { limit : '20mb' } ) );

// Pass app to routes
  routes( app );

// Start application
  app.listen( config.port, () => {
    logger.info( `Express running, now listening on port ${config.port}` );
  } );

});

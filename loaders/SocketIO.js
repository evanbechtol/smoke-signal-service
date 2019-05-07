const logger = require( "../services/Logger" );
const SocketControllerPath = "../controllers/Socket";
const Sentry = require( "@sentry/node" );

class SocketIOLoader {
  constructor ( server, path ) {
    const io = require( "socket.io" )( server, { path } );

    io.origins( "*:*" );

    // Events for default namespace
    io.on( "connection", function ( socket ) {
      logger.info( SocketIOLoader.connMsg( socket.id, "connected", "/" ) );

      require( SocketControllerPath )( io, socket );

      socket.on( "disconnect", () => {
        logger.info( SocketIOLoader.connMsg( socket.id, "disconnected", "/" ) );
      } );

      socket.on( "error", ( err ) => {
        logger.error( err );
        Sentry.withScope( scope => {
          scope.setTag( "socket", "Disconnect" );
          Sentry.captureException( err );
        } );
      } );
    } );

    // Events for /smoke-signal-service namespace
    io.of( "/smoke-signal-socket" ).on( "connection", function ( socket ) {
      logger.info( SocketIOLoader.connMsg( socket.id, "connected", "/smoke-signal/" ) );

      require( SocketControllerPath )( io, socket );

      socket.on( "disconnect", () => {
        logger.info( SocketIOLoader.connMsg( socket.id, "disconnected", "/smoke-signal/" ) );
      } );

      socket.on( "error", ( err ) => {
        logger.error( err );
        Sentry.withScope( scope => {
          scope.setTag( "socket", "Disconnect" );
          Sentry.captureException( err );
        } );
      } );
    } );
  }

  static connMsg ( action, id, nsp ) {
    return `User ID '${id}' ${action} from namespace ${nsp}`;
  }
}

module.exports = SocketIOLoader;
